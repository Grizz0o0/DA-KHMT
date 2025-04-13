import { Router } from 'express'
import bookingsControllers from '~/controllers/bookings.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication } from '~/middlewares/auth.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import {
  createBookingSchema,
  deleteBookingSchema,
  updateBookingSchema,
  searchBookingsSchema,
  getBookingByIdSchema
} from '~/requestSchemas/bookings.request'
import { authenticationSchema } from '~/requestSchemas/users.request'

const bookingsRouter = Router()
bookingsRouter.use(validateRequest({ headers: authenticationSchema }), authentication)

// Create booking
bookingsRouter.post(
  '/',
  validateRequest({ body: createBookingSchema.body }),
  asyncHandler(bookingsControllers.createBooking)
)

// Update booking
bookingsRouter.patch(
  '/:bookingId',
  validateRequest({ params: updateBookingSchema.params, body: updateBookingSchema.body }),
  asyncHandler(bookingsControllers.updateBooking)
)

// Delete booking
bookingsRouter.delete(
  '/:bookingId',
  validateRequest({ params: deleteBookingSchema.params }),
  asyncHandler(bookingsControllers.deleteBooking)
)

// Search bookings
bookingsRouter.get(
  '/search',
  validateRequest({ query: searchBookingsSchema.query }),
  asyncHandler(bookingsControllers.searchBookings)
)

// Get booking stats
bookingsRouter.get('/stats', asyncHandler(bookingsControllers.getBookingStats))

// Get booking by id
bookingsRouter.get(
  '/:bookingId',
  validateRequest({ params: getBookingByIdSchema.params }),
  asyncHandler(bookingsControllers.getBookingById)
)

export default bookingsRouter
