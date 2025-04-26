import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK } from '~/responses/success.response'
import BookingsService from '~/services/bookings.services'
import {
  createBookingSchema,
  CreateBookingTypeBody,
  updateBookingSchema,
  UpdateBookingTypeBody,
  deleteBookingSchema,
  DeleteBookingTypeParams,
  searchBookingsSchema,
  SearchBookingsTypeQuery,
  getBookingByIdSchema,
  GetBookingByIdTypeParams
} from '~/requestSchemas/bookings.request'

class BookingsController {
  createBooking = async (
    req: Request<ParamsDictionary, any, CreateBookingTypeBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedData = createBookingSchema.body.parse(req.body)
      const bookingResult = await BookingsService.createBooking(validatedData)
      new Created({
        message: 'Tạo đặt vé thành công',
        metadata: { booking: bookingResult }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  updateBooking = async (
    req: Request<ParamsDictionary, any, UpdateBookingTypeBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updateParams = updateBookingSchema.params.parse(req.params)
      const updatePayload = updateBookingSchema.body.parse(req.body)
      const bookingResult = await BookingsService.updateBooking(updateParams.bookingId, updatePayload)
      new OK({
        message: 'Cập nhật đặt vé thành công',
        metadata: { booking: bookingResult }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  deleteBooking = async (
    req: Request<ParamsDictionary, any, DeleteBookingTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const deleteParams = deleteBookingSchema.params.parse(req.params)
      const result = await BookingsService.deleteBooking(deleteParams.bookingId)
      new OK({
        message: 'Xóa đặt vé thành công',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  searchBookings = async (
    req: Request<ParamsDictionary, any, SearchBookingsTypeQuery>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const searchQuery = searchBookingsSchema.query.parse(req.query)
      const result = await BookingsService.searchBookings(searchQuery)
      new OK({
        message: 'Tìm kiếm booking thành công',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getBookingById = async (req: Request<any, any, GetBookingByIdTypeParams>, res: Response, next: NextFunction) => {
    try {
      const { bookingId } = getBookingByIdSchema.params.parse(req.params)
      const result = await BookingsService.getBookingById(bookingId)
      new OK({
        message: 'Lấy thông tin booking thành công',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getBookingStats = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const result = await BookingsService.getBookingStats()
      new OK({
        message: 'Lấy thống kê booking thành công',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }
}

export default new BookingsController()
