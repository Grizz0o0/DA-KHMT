import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { bookingSchema } from '~/models/bookings.model'
import {
  createBookingSchema,
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
class BookingsService {
  static async createBooking(payload: CreateBookingTypeBody) {
    const user = await databaseService.users.findOne({ _id: payload.userId })
    if (!user) throw new BadRequestError('Người dùng không tồn tại')

    const flight = await databaseService.flights.findOne({ _id: payload.flightId })
    if (!flight) throw new BadRequestError('Chuyến bay không tồn tại')
    if (flight.availableSeats < payload.quantity) throw new BadRequestError('Số ghế còn lại không đủ')

    const parsedBooking = bookingSchema.parse(payload)
    const booking = await databaseService.bookings.insertOne(parsedBooking)
    if (!booking.insertedId) throw new BadRequestError('Tạo booking thất bại')

    const updateResult = await databaseService.flights.updateOne(
      { _id: payload.flightId, availableSeats: { $gte: payload.quantity } },
      { $inc: { availableSeats: -payload.quantity } }
    )
    if (updateResult.modifiedCount === 0) throw new BadRequestError('Không thể cập nhật số ghế, vui lòng thử lại')

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

    // Nếu booking đã xác nhận hoặc đã hủy, không cho phép xóa
    if (booking.status === BookingStatus.Confirmed || booking.status === BookingStatus.Cancelled)
      throw new BadRequestError('Không thể xóa booking đã xác nhận hoặc đã hủy')

    // Nếu đã thanh toán, không cho phép xóa
    if (booking.paymentStatus === PaymentStatus.SUCCESS)
      throw new BadRequestError('Không thể xóa booking đã thanh toán')

    const result = await databaseService.bookings.deleteOne({ _id: bookingId })
    if (result.deletedCount === 0) throw new BadRequestError('Xóa booking thất bại')

    // Hoàn lại ghế cho chuyến bay
    await databaseService.flights.updateOne({ _id: booking.flightId }, { $inc: { availableSeats: booking.quantity } })
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
    const validatedQuery = getListBookingSchema.query.parse({
      limit,
      page,
      order,
      select
    })

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)

    const sortField = 'totalPrice'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: validatedQuery.order === 'asc' ? 1 : -1 }

    const projection = getSelectData(validatedQuery.select ?? [])
    const totalItems = await databaseService.bookings.countDocuments({})

    const bookings = await databaseService.bookings
      .find({})
      .sort(sortBy)
      .skip(skip)
      .project(projection)
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)

    return { bookings, pagination }
  }

  static async getBookingById(bookingId: ObjectId) {
    const booking = await databaseService.bookings.findOne({ _id: bookingId })
    if (!booking) throw new BadRequestError('Booking không tồn tại')

    // Lấy thông tin user và flight
    const [user, flight] = await Promise.all([
      databaseService.users.findOne({ _id: booking.userId }),
      databaseService.flights.findOne({ _id: booking.flightId })
    ])

    return {
      booking: { ...omitInfoData({ fields: ['createdAt', 'updatedAt'], object: booking }) },
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
      flight: flight ? omitInfoData({ fields: ['createdAt', 'updatedAt'], object: flight }) : null
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
