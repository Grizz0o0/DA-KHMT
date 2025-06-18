import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongo.utils'
import { getSelectData, omitInfoData } from '~/utils/object.utils'
import { createPagination } from '~/responses/success.response'
import { ObjectId } from 'mongodb'
import { TicketStatus } from '~/constants/tickets'
import {
  createMultipleTicketsTypeBody,
  createTicketTypeBody,
  deleteTicketSchema,
  getListTicketSchema,
  getListTicketTypeQuery,
  getTicketsByBookingIdTypeQuery,
  getTicketsByFlightIdTypeQuery,
  searchTicketsTypeQuery,
  updateTicketTypeBody
} from '~/requestSchemas/tickets.request'
import { ticketSchema } from '~/models/tickets.model'
import { FlightType } from '~/models/flights.model'
class TicketsServices {
  private static getTotalCapacity(flight: FlightType) {
    return flight.fareOptions.reduce((sum, option) => sum + (option.availableSeats ?? 0), 0)
  }

  private static async assignSeatNumber(flightId: ObjectId): Promise<string> {
    const flight = await databaseService.flights.findOne({ _id: flightId })
    if (!flight) throw new BadRequestError('Flight not found')

    const totalCapacity = this.getTotalCapacity(flight)
    const bookedSeats = await databaseService.tickets
      .find({
        flightId,
        status: { $ne: TicketStatus.Cancelled }
      })
      .toArray()

    const bookedNumbers = bookedSeats.map((t) => t.seatNumber)
    for (let i = 1; i <= totalCapacity; i++) {
      const candidate = `AUTO-${i}`
      if (!bookedNumbers.includes(candidate)) {
        return candidate
      }
    }

    throw new BadRequestError('No available seats')
  }

  private static async checkBookingAndGoFlightExist(bookingId: ObjectId, flightId: ObjectId) {
    const [booking, flight] = await Promise.all([
      databaseService.bookings.findOne({ _id: bookingId }),
      databaseService.flights.findOne({ _id: flightId })
    ])

    if (!booking) throw new BadRequestError('Booking not found')
    if (!flight) throw new BadRequestError('Go Flight not found')

    return { booking, flight }
  }

  private static async checkReturnFlightExist(returnFlightId?: ObjectId) {
    if (!returnFlightId) return null
    const returnFlight = await databaseService.flights.findOne({ _id: returnFlightId })
    if (!returnFlight) throw new BadRequestError('Return Flight not found')
    return returnFlight
  }

  private static async validateSeatAvailability(flightId: ObjectId, seatNumbers: string[]) {
    const existingTickets = await databaseService.tickets
      .find({
        flightId,
        seatNumber: { $in: seatNumbers },
        status: { $ne: TicketStatus.Cancelled }
      })
      .toArray()

    if (existingTickets.length > 0) {
      const bookedSeats = existingTickets.map((t) => t.seatNumber).join(', ')
      throw new BadRequestError(`Seats already booked: ${bookedSeats}`)
    }
  }

  static async createTicket(payload: createTicketTypeBody) {
    const { booking, flight } = await this.checkBookingAndGoFlightExist(payload.bookingId, payload.flightId)

    const totalCapacity = this.getTotalCapacity(flight)
    const totalBooked = await databaseService.tickets.countDocuments({
      flightId: payload.flightId,
      status: { $ne: TicketStatus.Cancelled }
    })
    if (totalCapacity - totalBooked <= 0) throw new BadRequestError('No available seats')

    const seatNumber = await this.assignSeatNumber(payload.flightId)
    const ticket = ticketSchema.parse({
      ...payload,
      seatNumber
    })
    const result = await databaseService.tickets.insertOne(ticket)
    await databaseService.users.updateOne({ _id: booking.userId }, { $addToSet: { tickets: result.insertedId } })
    return result
  }

  static async createMultipleTickets(payload: createMultipleTicketsTypeBody) {
    const { booking, flight } = await this.checkBookingAndGoFlightExist(payload.bookingId, payload.flightId)

    if (booking.returnFlightId) {
      await this.checkReturnFlightExist(booking.returnFlightId)
    }

    // Validate số lượng ghế còn lại
    const totalCapacity = this.getTotalCapacity(flight)
    const totalBooked = await databaseService.tickets.countDocuments({
      flightId: payload.flightId,
      status: { $ne: TicketStatus.Cancelled }
    })
    const remainingSeats = totalCapacity - totalBooked
    if (payload.tickets.length > remainingSeats) {
      throw new BadRequestError(
        `Not enough available seats (Available: ${remainingSeats}, Requested: ${payload.tickets.length})`
      )
    }

    // Tự động gán ghế cho từng vé
    const bookedSeats = await databaseService.tickets
      .find({
        flightId: payload.flightId,
        status: { $ne: TicketStatus.Cancelled }
      })
      .toArray()
    const bookedNumbers = bookedSeats.map((t) => t.seatNumber)

    const tickets = []
    let seatIndex = 1
    for (const t of payload.tickets) {
      while (bookedNumbers.includes(`AUTO-${seatIndex}`)) {
        seatIndex++
      }
      const seatNumber = `AUTO-${seatIndex}`
      bookedNumbers.push(seatNumber)

      tickets.push(
        ticketSchema.parse({
          ...t,
          seatNumber,
          seatClass: payload.seatClass,
          userId: payload.userId,
          bookingId: payload.bookingId,
          flightId: payload.flightId
        })
      )
      seatIndex++
    }

    const result = await databaseService.tickets.insertMany(tickets)
    const insertedIds = Object.values(result.insertedIds)

    // Cập nhật user
    await databaseService.users.updateOne({ _id: payload.userId }, { $addToSet: { tickets: { $each: insertedIds } } })
    return {
      insertedCount: result.insertedCount,
      insertedIds,
      tickets
    }
  }

  static async updateTicket(ticketId: ObjectId, payload: updateTicketTypeBody) {
    const ticket = await databaseService.tickets.findOne({ _id: ticketId })
    if (!ticket) throw new BadRequestError('Ticket not found')

    // Nếu cập nhật seatNumber, kiểm tra ghế mới có trống không
    if (payload.seatNumber && payload.seatNumber !== ticket.seatNumber)
      await this.validateSeatAvailability(ticket.flightId, [payload.seatNumber])

    // Nếu cập nhật status, kiểm tra status mới có hợp lệ không
    if (payload.status === TicketStatus.Cancelled && payload.status !== ticket.status) {
      const { canCancel, hoursUntilDeparture } = await this.canCancelTicket(ticketId)
      if (!canCancel)
        throw new BadRequestError(
          `Cannot cancel ticket: Only allowed before 24h from departure. (${hoursUntilDeparture.toFixed(2)}h left)`
        )
    }

    // Nếu cập nhật price, kiểm tra giá mới có hợp lệ không
    if (payload.price !== undefined && payload.price <= 0)
      throw new BadRequestError('Invalid ticket price: Price must be greater than 0')

    const result = await databaseService.tickets.findOneAndUpdate(
      { _id: ticketId },
      { $set: payload, $currentDate: { updatedAt: true } },
      { returnDocument: 'after' }
    )

    if (!result) throw new BadRequestError('Failed to update ticket')
    return result
  }

  static async deleteTicket(id: ObjectId) {
    const { ticketId } = deleteTicketSchema.params.parse({ ticketId: id })

    const del = await databaseService.tickets.findOneAndUpdate(
      { _id: ticketId },
      { $set: { status: TicketStatus.Cancelled }, $currentDate: { updatedAt: true } },
      { returnDocument: 'after' }
    )
    if (!del) throw new BadRequestError('Delete Ticket failed')

    await databaseService.users.updateOne({ _id: del.userId }, { $pull: { tickets: ticketId } })
    return del
  }

  static async searchTickets(query: searchTicketsTypeQuery) {
    const skip = (query.page - 1) * query.limit
    const matchCondition: Record<string, any> = {}

    if (query.bookingId) matchCondition.bookingId = query.bookingId
    if (query.flightId) matchCondition.flightId = query.flightId
    if (query.passengerEmail) matchCondition['passenger.email'] = query.passengerEmail
    if (query.passengerPassport) matchCondition['passenger.passportNumber'] = query.passengerPassport
    if (query.status) matchCondition.status = query.status
    if (query.seatNumber) matchCondition.seatNumber = query.seatNumber

    // Thực hiện tìm kiếm với phân trang
    const [tickets, total] = await Promise.all([
      databaseService.tickets
        .find(matchCondition)
        .skip(skip)
        .limit(query.limit)
        .sort({ [query.sortBy]: query.order === 'asc' ? 1 : -1 })
        .toArray(),
      databaseService.tickets.countDocuments(matchCondition)
    ])
    const pagination = createPagination(query.page, query.limit, total)

    return {
      tickets: tickets.map((ticket) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: ticket })),
      pagination
    }
  }

  static async getListTicket({
    limit = 10,
    page = 1,
    order = 'asc',
    select = [
      '_id',
      'bookingId',
      'flightId',
      'seatNumber',
      'seatClass',
      'passenger',
      'price',
      'status',
      'createdAt',
      'updatedAt'
    ]
  }: getListTicketTypeQuery) {
    const validatedQuery = getListTicketSchema.query.parse({
      limit,
      page,
      order,
      select
    })

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)

    const sortField = 'seatNumber'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: validatedQuery.order === 'asc' ? 1 : -1 }

    const projection = getSelectData(validatedQuery.select ?? [])

    const totalItems = await databaseService.tickets.countDocuments({})

    const tickets = await databaseService.tickets
      .find({})
      .sort(sortBy)
      .skip(skip)
      .project(projection)
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)

    return { tickets, pagination }
  }

  static async getTicketById(ticketId: ObjectId) {
    const ticket = await databaseService.tickets.findOne({ _id: ticketId })
    if (!ticket) throw new BadRequestError('Ticket not found')
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: ticket })
  }

  static async getTicketsByBookingId(bookingId: ObjectId, query: getTicketsByBookingIdTypeQuery) {
    const skip = (query.page - 1) * query.limit
    const sortField = query.sortBy
    const sortOrder = query.order === 'asc' ? 1 : -1

    const [tickets, total] = await Promise.all([
      databaseService.tickets
        .find({ bookingId })
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(query.limit)
        .toArray(),
      databaseService.tickets.countDocuments({ bookingId })
    ])

    const pagination = createPagination(query.page, query.limit, total)
    return {
      tickets: tickets.map((ticket) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: ticket })),
      pagination
    }
  }

  static async getTicketsByFlightId(flightId: ObjectId, query: getTicketsByFlightIdTypeQuery) {
    const skip = (query.page - 1) * query.limit
    const sortField = query.sortBy
    const sortOrder = query.order === 'asc' ? 1 : -1

    const [tickets, total] = await Promise.all([
      databaseService.tickets
        .find({ flightId })
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(query.limit)
        .toArray(),
      databaseService.tickets.countDocuments({ flightId })
    ])

    const pagination = createPagination(query.page, query.limit, total)
    return {
      tickets: tickets.map((ticket) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: ticket })),
      pagination
    }
  }

  //Thống kê số vé theo trạng thái
  static async getTicketStats(flightId: ObjectId) {
    const stats = await databaseService.tickets
      .aggregate([
        { $match: { flightId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    return stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count
      return acc
    }, {})
  }

  //Kiểm tra ghế còn trống:
  static async getAvailableSeats(flightId: ObjectId) {
    const flight = await databaseService.flights.findOne({ _id: flightId })
    if (!flight) throw new BadRequestError('Flight not found')

    const bookedSeats = await databaseService.tickets
      .find({
        flightId,
        status: { $ne: TicketStatus.Cancelled }
      })
      .project({ seatNumber: 1 })
      .toArray()

    const bookedSeatNumbers = bookedSeats.map((ticket) => ticket.seatNumber)
    return this.getTotalCapacity(flight) - bookedSeatNumbers.length
  }

  //Lấy danh sách ghế đã đặt:
  static async getBookedSeats(flightId: ObjectId) {
    const bookedSeats = await databaseService.tickets
      .find({
        flightId,
        status: { $ne: TicketStatus.Cancelled }
      })
      .project({
        seatNumber: 1,
        passenger: 1,
        status: 1
      })
      .toArray()

    return bookedSeats
  }

  //Kiểm tra thời gian hủy vé:
  static async canCancelTicket(ticketId: ObjectId) {
    const ticket = await databaseService.tickets.findOne({ _id: ticketId })
    if (!ticket) throw new BadRequestError('Ticket not found')

    // Kiểm tra thời gian hủy vé (ví dụ: trước 24h)
    const flight = await databaseService.flights.findOne({ _id: ticket.flightId })
    if (!flight) throw new BadRequestError('Flight not found')

    const now = new Date()
    const departureTime = new Date(flight.departureTime)
    const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    return {
      canCancel: hoursUntilDeparture > 24,
      hoursUntilDeparture
    }
  }

  //Lấy danh sách vé của một hành khách
  static async getPassengerTickets(passengerEmail: string, query: searchTicketsTypeQuery) {
    const skip = (query.page - 1) * query.limit
    const sortField = query.sortBy
    const sortOrder = query.order === 'asc' ? 1 : -1

    const [tickets, total] = await Promise.all([
      databaseService.tickets
        .find({ 'passenger.email': passengerEmail })
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(query.limit)
        .toArray(),
      databaseService.tickets.countDocuments({ 'passenger.email': passengerEmail })
    ])

    const pagination = createPagination(query.page, query.limit, total)
    return {
      tickets: tickets.map((ticket) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: ticket })),
      pagination
    }
  }
}

export default TicketsServices
