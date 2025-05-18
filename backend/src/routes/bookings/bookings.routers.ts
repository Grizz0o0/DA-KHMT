import { Router } from 'express'
import bookingsControllers from '~/controllers/bookings.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication, authorizeRoles } from '~/middlewares/auth.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import {
  createBookingSchema,
  deleteBookingSchema,
  updateBookingSchema,
  searchBookingsSchema,
  getBookingByIdSchema,
  getListBookingSchema
} from '~/requestSchemas/bookings.request'
import { authenticationSchema } from '~/requestSchemas/users.request'
import { UserRole } from '~/constants/users'
const bookingsRouter = Router()
bookingsRouter.use(validateRequest({ headers: authenticationSchema }), authentication)

// Create booking
bookingsRouter.post(
  '/',
  validateRequest({ body: createBookingSchema.body }),
  asyncHandler(bookingsControllers.createBooking)
)

bookingsRouter.get(
  '/',
  validateRequest({ query: getListBookingSchema.query }),
  asyncHandler(bookingsControllers.getListBooking)
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
  authorizeRoles(UserRole.ADMIN),
  asyncHandler(bookingsControllers.deleteBooking)
)

// Search bookings
bookingsRouter.get(
  '/search',
  validateRequest({ query: searchBookingsSchema.query }),
  authorizeRoles(UserRole.ADMIN),
  asyncHandler(bookingsControllers.searchBookings)
)

// Get booking stats
bookingsRouter.get('/stats', authorizeRoles(UserRole.ADMIN), asyncHandler(bookingsControllers.getBookingStats))

// Get booking by id
bookingsRouter.get(
  '/:bookingId',
  validateRequest({ params: getBookingByIdSchema.params }),
  asyncHandler(bookingsControllers.getBookingById)
)

export default bookingsRouter
