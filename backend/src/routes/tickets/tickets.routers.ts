import { Router } from 'express'
import ticketsControllers from '~/controllers/tickets.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication } from '~/middlewares/auth.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import {
  createTicketSchema,
  createMultipleTicketsSchema,
  updateTicketSchema,
  getTicketByIdSchema,
  searchTicketsSchema,
  getTicketsByBookingIdSchema,
  getTicketsByFlightIdSchema,
  getTicketStatsSchema,
  getAvailableSeatsSchema,
  getBookedSeatsSchema,
  canCancelTicketSchema,
  getPassengerTicketsSchema,
  updateMultipleTicketsStatusSchema
} from '~/requestSchemas/tickets.request'
import { authenticationSchema } from '~/requestSchemas/users.request'

const ticketsRouter = Router()
ticketsRouter.use(validateRequest({ headers: authenticationSchema }), authentication)

// Create ticket
ticketsRouter.post(
  '/',
  validateRequest({ body: createTicketSchema.body }),
  asyncHandler(ticketsControllers.createTicket)
)

// Create multiple tickets
ticketsRouter.post(
  '/multiple',
  validateRequest({ body: createMultipleTicketsSchema.body }),
  asyncHandler(ticketsControllers.createMultipleTickets)
)

// Update ticket
ticketsRouter.patch(
  '/:ticketId',
  validateRequest({
    params: updateTicketSchema.params,
    body: updateTicketSchema.body
  }),
  asyncHandler(ticketsControllers.updateTicket)
)

// Delete ticket
ticketsRouter.delete('/:ticketId', asyncHandler(ticketsControllers.deleteTicket))

// Get ticket by ID
ticketsRouter.get(
  '/:ticketId',
  validateRequest({ params: getTicketByIdSchema.params }),
  asyncHandler(ticketsControllers.getTicketById)
)

// Search tickets
ticketsRouter.get(
  '/',
  validateRequest({ query: searchTicketsSchema.query }),
  asyncHandler(ticketsControllers.searchTickets)
)

// Get ticket by ID
ticketsRouter.get(
  '/:ticketId',
  validateRequest({ params: getTicketByIdSchema.params }),
  asyncHandler(ticketsControllers.getTicketById)
)

// Get tickets by booking ID
ticketsRouter.get(
  '/booking/:bookingId',
  validateRequest({ params: getTicketsByBookingIdSchema.params, query: getTicketsByBookingIdSchema.query }),
  asyncHandler(ticketsControllers.getTicketsByBookingId)
)

// Get tickets by flight ID
ticketsRouter.get(
  '/flight/:flightId',
  validateRequest({ params: getTicketsByFlightIdSchema.params, query: getTicketsByFlightIdSchema.query }),
  asyncHandler(ticketsControllers.getTicketsByFlightId)
)

// Get ticket stats
ticketsRouter.get(
  '/stats/:flightId',
  validateRequest({ params: getTicketStatsSchema.params }),
  asyncHandler(ticketsControllers.getTicketStats)
)

// Get available seats
ticketsRouter.get(
  '/available-seats/:flightId',
  validateRequest({ params: getAvailableSeatsSchema.params }),
  asyncHandler(ticketsControllers.getAvailableSeats)
)

// Get booked seats
ticketsRouter.get(
  '/booked-seats/:flightId',
  validateRequest({ params: getBookedSeatsSchema.params }),
  asyncHandler(ticketsControllers.getBookedSeats)
)

// Check if ticket can be cancelled
ticketsRouter.get(
  '/can-cancel/:ticketId',
  validateRequest({ params: canCancelTicketSchema.params }),
  asyncHandler(ticketsControllers.canCancelTicket)
)

// Get passenger tickets
ticketsRouter.get(
  '/passenger/:passengerEmail',
  validateRequest({ params: getPassengerTicketsSchema.params, query: getPassengerTicketsSchema.query }),
  asyncHandler(ticketsControllers.getPassengerTickets)
)
export default ticketsRouter
