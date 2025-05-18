import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK } from '~/responses/success.response'
import TicketsServices from '~/services/tickets.services'
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
  deleteTicketSchema,
  getListTicketSchema
} from '~/requestSchemas/tickets.request'

class TicketsController {
  createTicket = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const ticketBody = createTicketSchema.body.parse(req.body)
      const ticketResult = await TicketsServices.createTicket(ticketBody)
      new Created({
        message: 'Ticket created successfully',
        metadata: { ticket: ticketResult }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  createMultipleTickets = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const ticketsBody = createMultipleTicketsSchema.body.parse(req.body)
      const result = await TicketsServices.createMultipleTickets(ticketsBody)
      new Created({
        message: 'Tickets created successfully',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  updateTicket = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { ticketId } = updateTicketSchema.params.parse(req.params)
      const updateBody = updateTicketSchema.body.parse(req.body)
      const result = await TicketsServices.updateTicket(ticketId, updateBody)
      new OK({
        message: 'Ticket updated successfully',
        metadata: { ticket: result }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  deleteTicket = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { ticketId } = deleteTicketSchema.params.parse(req.params)
      const result = await TicketsServices.deleteTicket(ticketId)
      new OK({
        message: 'Ticket deleted successfully',
        metadata: { ticket: result }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  searchTickets = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const query = searchTicketsSchema.query.parse(req.query)
      const result = await TicketsServices.searchTickets(query)
      new OK({
        message: 'Get tickets successfully',
        metadata: {
          tickets: result.tickets,
          pagination: result.pagination
        }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getListTickets = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const query = getListTicketSchema.query.parse(req.query)
      const result = await TicketsServices.getListTicket(query)
      new OK({
        message: 'Get tickets successfully',
        metadata: {
          tickets: result.tickets,
          pagination: result.pagination
        }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getTicketById = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { ticketId } = getTicketByIdSchema.params.parse(req.params)
      const ticket = await TicketsServices.getTicketById(ticketId)
      new OK({
        message: 'Get ticket successfully',
        metadata: { ticket }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getTicketsByBookingId = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { bookingId } = getTicketsByBookingIdSchema.params.parse(req.params)
      const query = getTicketsByBookingIdSchema.query.parse(req.query)
      const result = await TicketsServices.getTicketsByBookingId(bookingId, query)
      new OK({
        message: 'Get tickets by booking ID successfully',
        metadata: {
          tickets: result.tickets,
          pagination: result.pagination
        }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getTicketsByFlightId = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { flightId } = getTicketsByFlightIdSchema.params.parse(req.params)
      const query = getTicketsByFlightIdSchema.query.parse(req.query)
      const result = await TicketsServices.getTicketsByFlightId(flightId, query)
      new OK({
        message: 'Get tickets by flight ID successfully',
        metadata: {
          tickets: result.tickets,
          pagination: result.pagination
        }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getTicketStats = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { flightId } = getTicketStatsSchema.params.parse(req.params)
      const stats = await TicketsServices.getTicketStats(flightId)
      new OK({
        message: 'Get ticket stats successfully',
        metadata: { stats }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAvailableSeats = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { flightId } = getAvailableSeatsSchema.params.parse(req.params)
      const availableSeats = await TicketsServices.getAvailableSeats(flightId)
      new OK({
        message: 'Get available seats successfully',
        metadata: { availableSeats }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getBookedSeats = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { flightId } = getBookedSeatsSchema.params.parse(req.params)
      const bookedSeats = await TicketsServices.getBookedSeats(flightId)
      new OK({
        message: 'Get booked seats successfully',
        metadata: { bookedSeats }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  canCancelTicket = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { ticketId } = canCancelTicketSchema.params.parse(req.params)
      const result = await TicketsServices.canCancelTicket(ticketId)
      new OK({
        message: 'Check if ticket can be cancelled successfully',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getPassengerTickets = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { passengerEmail } = getPassengerTicketsSchema.params.parse(req.params)
      const query = getPassengerTicketsSchema.query.parse(req.query)
      const result = await TicketsServices.getPassengerTickets(passengerEmail, query)
      new OK({
        message: 'Get passenger tickets successfully',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }
}

export default new TicketsController()
