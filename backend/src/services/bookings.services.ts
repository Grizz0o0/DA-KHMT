import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { bookingSchema } from '~/models/bookings.model'
import {
  CreateBookingTypeBody,
  UpdateBookingTypeBody,
  searchBookingsSchema,
  SearchBookingsTypeQuery,
  getListBookingTypeQuery,
  getListBookingSchema
} from '~/requestSchemas/bookings.request'
import { getSelectData, omitInfoData } from '~/utils/object.utils'
import { BookingStatus } from '~/constants/bookings'
import { ObjectId } from 'mongodb'
import { Sort } from 'mongodb'
import { PaymentStatus } from '~/constants/payments'
import { createPagination } from '~/responses/success.response'
import { convertToObjectId } from '~/utils/mongo.utils'
class BookingsService {
  static async createBooking(payload: CreateBookingTypeBody) {
    const user = await databaseService.users.findOne({ _id: payload.userId })
    if (!user) throw new BadRequestError('Người dùng không tồn tại')

    // Fetch go flight
    const goFlight = await databaseService.flights.findOne({ _id: payload.goFlightId })
    if (!goFlight) throw new BadRequestError('Chuyến bay chiều đi không tồn tại')

    const goFareOption = goFlight.fareOptions.find((option) => option.class === payload.seatClassGo)
    if (!goFareOption) throw new BadRequestError('Hạng ghế chiều đi không tồn tại')
    if (goFareOption.availableSeats < payload.quantity) throw new BadRequestError('Số ghế chiều đi không đủ')

    // Fetch return flight (optional)
    let returnFareOption = null
    if (payload.returnFlightId && payload.seatClassReturn) {
      const returnFlight = await databaseService.flights.findOne({ _id: payload.returnFlightId })
      if (!returnFlight) throw new BadRequestError('Chuyến bay chiều về không tồn tại')

      returnFareOption = returnFlight.fareOptions.find((option) => option.class === payload.seatClassReturn)
      if (!returnFareOption) throw new BadRequestError('Hạng ghế chiều về không tồn tại')
      if (returnFareOption.availableSeats < payload.quantity) throw new BadRequestError('Số ghế chiều về không đủ')
    }

    // Insert Booking
    const parsedBooking = bookingSchema.parse(payload)
    const booking = await databaseService.bookings.insertOne(parsedBooking)
    if (!booking.insertedId) throw new BadRequestError('Tạo booking thất bại')

    // Update seats GO flight
    const updateGoFlight = await databaseService.flights.updateOne(
      {
        _id: payload.goFlightId,
        'fareOptions.class': payload.seatClassGo,
        'fareOptions.availableSeats': { $gte: payload.quantity }
      },
      {
        $inc: { 'fareOptions.$.availableSeats': -payload.quantity }
      }
    )
    if (updateGoFlight.modifiedCount === 0) throw new BadRequestError('Không thể cập nhật số ghế chiều đi')

    // Update seats RETURN flight
    if (payload.returnFlightId && payload.seatClassReturn) {
      const updateReturnFlight = await databaseService.flights.updateOne(
        {
          _id: payload.returnFlightId,
          'fareOptions.class': payload.seatClassReturn,
          'fareOptions.availableSeats': { $gte: payload.quantity }
        },
        {
          $inc: { 'fareOptions.$.availableSeats': -payload.quantity }
        }
      )
      if (updateReturnFlight.modifiedCount === 0) throw new BadRequestError('Không thể cập nhật số ghế chiều về')
    }

    const createdBooking = await databaseService.bookings.findOne({ _id: booking.insertedId })
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: createdBooking })
  }

  static async updateBooking(bookingId: ObjectId, payload: UpdateBookingTypeBody) {
    const booking = await databaseService.bookings.findOne({ _id: bookingId })
    if (!booking) throw new BadRequestError('Booking không tồn tại')

    // Nếu booking đã xác nhận hoặc đã hủy, không cho phép update
    if (booking.status === BookingStatus.Confirmed || booking.status === BookingStatus.Cancelled)
      throw new BadRequestError('Không thể cập nhật booking đã xác nhận hoặc đã hủy')

    // Nếu đang update status thành Confirmed hoặc Cancelled
    if (payload.status === BookingStatus.Confirmed || payload.status === BookingStatus.Cancelled) {
      // Nếu chưa thanh toán, không cho phép xác nhận
      if (booking.paymentStatus !== PaymentStatus.SUCCESS)
        throw new BadRequestError('Phải thanh toán trước khi xác nhận booking')
    }

    const updatedBooking = await databaseService.bookings.findOneAndUpdate(
      { _id: bookingId },
      { $set: payload },
      { returnDocument: 'after' }
    )

    if (!updatedBooking) throw new BadRequestError('Cập nhật booking thất bại')

    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: updatedBooking })
  }

  static async deleteBooking(bookingId: ObjectId) {
    const booking = await databaseService.bookings.findOne({ _id: bookingId })
    if (!booking) throw new BadRequestError('Booking không tồn tại')

    // Nếu booking đã confirmed hoặc cancelled, không cho phép xóa
    if (booking.status === BookingStatus.Confirmed || booking.status === BookingStatus.Cancelled) {
      throw new BadRequestError('Không thể xóa booking đã xác nhận hoặc đã hủy')
    }

    // Nếu đã thanh toán thành công, không cho phép xóa
    if (booking.paymentStatus === PaymentStatus.SUCCESS) {
      throw new BadRequestError('Không thể xóa booking đã thanh toán')
    }

    const result = await databaseService.bookings.deleteOne({ _id: bookingId })
    if (result.deletedCount === 0) {
      throw new BadRequestError('Xóa booking thất bại')
    }

    // Hoàn lại ghế cho chuyến bay chiều đi
    if (booking.goFlightId) {
      await databaseService.flights.updateOne(
        { _id: booking.goFlightId },
        { $inc: { availableSeats: booking.quantity } }
      )
    }

    // Hoàn lại ghế cho chuyến bay chiều về (nếu có)
    if (booking.returnFlightId) {
      await databaseService.flights.updateOne(
        { _id: booking.returnFlightId },
        { $inc: { availableSeats: booking.quantity } }
      )
    }

    return { message: 'Xóa booking thành công' }
  }

  static async searchBookings(query: SearchBookingsTypeQuery) {
    const {
      userId,
      flightId,
      status,
      paymentStatus,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      page,
      limit,
      sortBy,
      sortOrder
    } = query

    // Build filter
    const filter: Record<string, any> = {}
    if (userId) filter.userId = userId
    if (flightId) filter.flightId = flightId
    if (status) filter.status = status
    if (paymentStatus) filter.paymentStatus = paymentStatus
    if (startDate || endDate) {
      filter.bookingTime = {}
      if (startDate) filter.bookingTime.$gte = startDate
      if (endDate) filter.bookingTime.$lte = endDate
    }
    if (minPrice || maxPrice) {
      filter.totalPrice = {}
      if (minPrice) filter.totalPrice.$gte = minPrice
      if (maxPrice) filter.totalPrice.$lte = maxPrice
    }

    const skip = (page - 1) * limit
    const sort: Sort = [[sortBy, sortOrder === 'desc' ? -1 : 1]]

    const [bookings, total] = await Promise.all([
      databaseService.bookings.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      databaseService.bookings.countDocuments(filter)
    ])

    return {
      bookings: bookings.map((booking) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: booking })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getListBooking({
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['status', 'seatClass', 'quantity', 'totalPrice', 'bookingTime', 'paymentStatus', 'createdAt']
  }: getListBookingTypeQuery) {
    const skip = ((page ?? 1) - 1) * (limit ?? 10)

    const sortField = 'totalPrice'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: order === 'asc' ? 1 : -1 }

    const projection = getSelectData(select ?? [])
    const totalItems = await databaseService.bookings.countDocuments({})

    const bookings = await databaseService.bookings
      .find({})
      .sort(sortBy)
      .skip(skip)
      .project(projection)
      .limit(limit ?? 10)
      .toArray()

    const pagination = createPagination(page ?? 1, limit ?? 10, totalItems)

    return { bookings, pagination }
  }

  static async getBookingByUserId(
    userId: string,
    {
      limit = 10,
      page = 1,
      order = 'asc',
      select = ['status', 'seatClass', 'quantity', 'totalPrice', 'bookingTime', 'paymentStatus', 'createdAt']
    }
  ) {
    const skip = ((page ?? 1) - 1) * (limit ?? 10)

    const sortField = 'totalPrice'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: order === 'asc' ? 1 : -1 }

    const projection = getSelectData(select ?? [])

    const filter = { userId: convertToObjectId(userId) }
    const totalItems = await databaseService.bookings.countDocuments(filter)

    const bookings = await databaseService.bookings
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .project(projection)
      .limit(limit ?? 10)
      .toArray()

    const pagination = createPagination(page ?? 1, limit ?? 10, totalItems)

    return {
      bookings: bookings.map((booking) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: booking })),
      pagination
    }
  }

  static async getBookingById(bookingId: ObjectId) {
    const booking = await databaseService.bookings.findOne({ _id: bookingId })
    if (!booking) throw new BadRequestError('Booking không tồn tại')

    // Lấy thông tin user
    const userPromise = databaseService.users.findOne({ _id: booking.userId })

    // Lấy thông tin flight chiều đi
    const goFlightPromise = booking.goFlightId
      ? databaseService.flights.findOne({ _id: booking.goFlightId })
      : Promise.resolve(null)

    // Lấy thông tin flight chiều về (nếu có)
    const returnFlightPromise = booking.returnFlightId
      ? databaseService.flights.findOne({ _id: booking.returnFlightId })
      : Promise.resolve(null)

    const [user, goFlight, returnFlight] = await Promise.all([userPromise, goFlightPromise, returnFlightPromise])

    return {
      booking: {
        ...omitInfoData({
          fields: ['createdAt', 'updatedAt'],
          object: booking
        })
      },
      user: user
        ? omitInfoData({
            fields: [
              'password',
              'createdAt',
              'updatedAt',
              'role',
              'verify',
              'authProvider',
              'verifyEmailToken',
              'forgotPasswordToken'
            ],
            object: user
          })
        : null,
      goFlight: goFlight ? omitInfoData({ fields: ['createdAt', 'updatedAt'], object: goFlight }) : null,
      returnFlight: returnFlight
        ? omitInfoData({
            fields: ['createdAt', 'updatedAt'],
            object: returnFlight
          })
        : null
    }
  }

  static async getBookingStats() {
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      successPayment,
      pendingPayment,
      failedPayment,
      totalRevenue
    ] = await Promise.all([
      databaseService.bookings.countDocuments({}),
      databaseService.bookings.countDocuments({ status: BookingStatus.Confirmed }),
      databaseService.bookings.countDocuments({ status: BookingStatus.Cancelled }),
      databaseService.bookings.countDocuments({ status: BookingStatus.Pending }),
      databaseService.bookings.countDocuments({ paymentStatus: PaymentStatus.SUCCESS }),
      databaseService.bookings.countDocuments({ paymentStatus: PaymentStatus.PENDING }),
      databaseService.bookings.countDocuments({ paymentStatus: PaymentStatus.FAILED }),
      databaseService.bookings
        .aggregate([
          { $match: { paymentStatus: PaymentStatus.SUCCESS } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ])
        .toArray()
    ])

    return {
      totalBookings,
      statusStats: {
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        pending: pendingBookings
      },
      paymentStats: {
        pending: pendingPayment,
        success: successPayment,
        failed: failedPayment
      },
      totalRevenue: totalRevenue[0]?.total || 0
    }
  }
}

export default BookingsService
