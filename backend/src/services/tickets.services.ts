import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongoUtils'
import { getSelectData, omitInfoData } from '~/utils/objectUtils'
import { createPagination } from '~/responses/success.response'
import { ObjectId } from 'mongodb'
import { TicketStatus } from '~/constants/tickets'
import {
  createMultipleTicketsTypeBody,
  createTicketTypeBody,
  deleteTicketSchema,
  getTicketsByBookingIdTypeQuery,
  getTicketsByFlightIdTypeQuery,
  searchTicketsTypeQuery,
  updateTicketTypeBody
} from '~/requestSchemas/tickets.request'
import { ticketSchema } from '~/models/tickets.model'
class TicketsServices {
  static async createTicket(payload: createTicketTypeBody) {
    const booking = await databaseService.bookings.findOne({
      _id: payload.bookingId
    })
    if (!booking) throw new BadRequestError('Booking not found')

    const flight = await databaseService.flights.findOne({
      _id: payload.flightId
    })
    if (!flight) throw new BadRequestError('Flight not found')

    const existingTicket = await databaseService.tickets.findOne({
      flightId: payload.flightId,
      seatNumber: payload.seatNumber,
      status: { $ne: TicketStatus.Cancelled }
    })
    if (existingTicket) {
      throw new BadRequestError('Seat is already booked')
    }

    const ticket = ticketSchema.parse(payload)
    const result = await databaseService.tickets.insertOne(ticket)
    return result
  }

  static async createMultipleTickets(payload: createMultipleTicketsTypeBody) {
    const booking = await databaseService.bookings.findOne({
      _id: payload.bookingId
    })
    if (!booking) throw new BadRequestError('Booking not found')

    const flight = await databaseService.flights.findOne({
      _id: payload.flightId
    })
    if (!flight) throw new BadRequestError('Flight not found')

    // Kiểm tra ghế bị trùng trong payload
    const seatNumbers = payload.tickets.map((ticket) => ticket.seatNumber)
    const uniqueSeatNumbers = new Set(seatNumbers)
    if (uniqueSeatNumbers.size !== seatNumbers.length) {
      throw new BadRequestError('Duplicate seat numbers in request')
    }

    // Kiểm tra ghế đã được đặt trước chưa
    const existingTickets = await databaseService.tickets
      .find({
        flightId: payload.flightId,
        seatNumber: { $in: seatNumbers },
        status: { $ne: TicketStatus.Cancelled }
      })
      .toArray()

    if (existingTickets.length > 0) {
      const bookedSeats = existingTickets.map((ticket) => ticket.seatNumber).join(', ')
      throw new BadRequestError(`Seats already booked: ${bookedSeats}`)
    }

    // Kiểm tra tổng số vé không vượt quá số ghế
    const totalTickets = await databaseService.tickets.countDocuments({
      flightId: payload.flightId,
      status: { $ne: TicketStatus.Cancelled }
    })
    if (totalTickets + payload.tickets.length > flight.availableSeats) {
      throw new BadRequestError('Not enough available seats')
    }

    // Kiểm tra giá vé hợp lệ
    const invalidPriceTickets = payload.tickets.filter((ticket) => ticket.price <= 0)
    if (invalidPriceTickets.length > 0) {
      throw new BadRequestError('Invalid ticket price: Price must be greater than 0')
    }

    // Parse và chuẩn hóa dữ liệu
    const tickets = payload.tickets.map((ticketData) => {
      return ticketSchema.parse({
        bookingId: payload.bookingId,
        flightId: payload.flightId,
        seatNumber: ticketData.seatNumber,
        passenger: ticketData.passenger,
        price: ticketData.price,
        status: ticketData.status
      })
    })

    const result = await databaseService.tickets.insertMany(tickets)
    return {
      insertedCount: result.insertedCount,
      tickets
    }
  }

  static async updateTicket(ticketId: ObjectId, payload: updateTicketTypeBody) {
    const ticket = await databaseService.tickets.findOne({
      _id: ticketId
    })
    if (!ticket) throw new BadRequestError('Ticket not found')

    // Nếu cập nhật seatNumber, kiểm tra ghế mới có trống không
    if (payload.seatNumber && payload.seatNumber !== ticket.seatNumber) {
      const existingTicket = await databaseService.tickets.findOne({
        flightId: ticket.flightId,
        seatNumber: payload.seatNumber,
        status: { $ne: TicketStatus.Cancelled },
        _id: { $ne: ticketId }
      })
      if (existingTicket) {
        throw new BadRequestError('Seat is already booked')
      }
    }

    // Nếu cập nhật status, kiểm tra status mới có hợp lệ không
    if (payload.status === TicketStatus.Cancelled && payload.status !== ticket.status) {
      const { canCancel, hoursUntilDeparture } = await this.canCancelTicket(ticketId)
      if (!canCancel) {
        throw new BadRequestError(
          `Cannot cancel ticket: Only allowed before 24h from departure. (${hoursUntilDeparture.toFixed(2)}h left)`
        )
      }
    }

    // Nếu cập nhật price, kiểm tra giá mới có hợp lệ không
    if (payload.price !== undefined && payload.price <= 0) {
      throw new BadRequestError('Invalid ticket price: Price must be greater than 0')
    }

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

    const del = await databaseService.tickets.findOneAndDelete({ _id: ticketId })
    if (!del) throw new BadRequestError('Delete Ticket failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: del })
  }

  static async searchTickets(query: searchTicketsTypeQuery) {
    const skip = (query.page - 1) * query.limit
    const matchCondition: Record<string, any> = {}

    if (query.bookingId) matchCondition.bookingId = query.bookingId
    if (query.flightId) matchCondition.flightId = query.flightId
    if (query.passengerEmail) matchCondition['passenger.email'] = query.passengerEmail
    if (query.passengerPassport) matchCondition['passenger.passportNumber'] = query.passengerPassport

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
      tickets: tickets.map((ticket) => omitInfoData({ fields: ['createAt', 'updateAt'], object: ticket })),
      pagination
    }
  }

  static async getTicketById(ticketId: ObjectId) {
    const ticket = await databaseService.tickets.findOne({ _id: ticketId })
    if (!ticket) throw new BadRequestError('Ticket not found')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: ticket })
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
      tickets: tickets.map((ticket) => omitInfoData({ fields: ['createAt', 'updateAt'], object: ticket })),
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
      tickets: tickets.map((ticket) => omitInfoData({ fields: ['createAt', 'updateAt'], object: ticket })),
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
    return flight.availableSeats - bookedSeatNumbers.length
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
      tickets: tickets.map((ticket) => omitInfoData({ fields: ['createAt', 'updateAt'], object: ticket })),
      pagination
    }
  }
}

export default TicketsServices
