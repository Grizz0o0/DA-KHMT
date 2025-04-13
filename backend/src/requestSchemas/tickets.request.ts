import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { TicketStatus } from '~/constants/tickets'

const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

const paginationParams = {
  page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').default(1),
  limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').default(10),
  order: z.enum(['asc', 'desc']).default('asc'),
  sortBy: z
    .enum(['bookingId', 'flightId', 'passengerEmail', 'passengerPassport', 'status', 'seatNumber'])
    .default('bookingId')
}

// Schema for passenger information
const passengerSchema = z.object({
  name: z.string().min(1, 'Passenger name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other']),
  nationality: z.string().min(1, 'Nationality is required'),
  passportNumber: z.string(),
  idNumber: z.string()
})

// Schema for creating a ticket
export const createTicketSchema = {
  body: z.object({
    bookingId: objectIdSchema,
    flightId: objectIdSchema,
    seatNumber: z.string().min(1, 'Seat number is required'),
    passenger: passengerSchema,
    price: z.number().min(0, 'Price must be non-negative'),
    status: z.nativeEnum(TicketStatus).default(TicketStatus.Unused)
  })
}
export type createTicketTypeBody = z.infer<typeof createTicketSchema.body>

// Schema for creating multiple tickets
export const createMultipleTicketsSchema = {
  body: z.object({
    bookingId: objectIdSchema,
    flightId: objectIdSchema,
    tickets: z.array(
      z.object({
        seatNumber: z.string().min(1, 'Seat number is required'),
        passenger: passengerSchema,
        price: z.number().min(0, 'Price must be non-negative'),
        status: z.nativeEnum(TicketStatus).default(TicketStatus.Unused)
      })
    )
  })
}
export type createMultipleTicketsTypeBody = z.infer<typeof createMultipleTicketsSchema.body>

// Schema for updating ticket status
export const updateTicketStatusSchema = {
  params: z.object({
    ticketId: objectIdSchema
  }),
  body: z.object({
    status: z.nativeEnum(TicketStatus)
  })
}
export type updateTicketStatusTypeParams = z.infer<typeof updateTicketStatusSchema.params>
export type updateTicketStatusTypeBody = z.infer<typeof updateTicketStatusSchema.body>

// Schema for updating ticket
export const updateTicketSchema = {
  params: z.object({
    ticketId: objectIdSchema
  }),
  body: z.object({
    seatNumber: z.string().min(1, 'Seat number is required').optional(),
    passenger: passengerSchema.optional(),
    price: z.number().min(0, 'Price must be non-negative').optional(),
    status: z.nativeEnum(TicketStatus).optional()
  })
}
export type updateTicketTypeParams = z.infer<typeof updateTicketSchema.params>
export type updateTicketTypeBody = z.infer<typeof updateTicketSchema.body>

// Schema for searching tickets
export const searchTicketsSchema = {
  query: z.object({
    bookingId: objectIdSchema.optional(),
    flightId: objectIdSchema.optional(),
    passengerEmail: z.string().optional(),
    passengerPassport: z.string().optional(),
    status: z.nativeEnum(TicketStatus).optional(),
    seatNumber: z.string().optional(),
    ...paginationParams
  })
}
export type searchTicketsTypeQuery = z.infer<typeof searchTicketsSchema.query>

// Schema for deleting ticket
export const deleteTicketSchema = {
  params: z.object({
    ticketId: objectIdSchema
  })
}
export type deleteTicketTypeParams = z.infer<typeof deleteTicketSchema.params>

// Schema for getting ticket by ID
export const getTicketByIdSchema = {
  params: z.object({
    ticketId: objectIdSchema
  })
}
export type getTicketByIdTypeParams = z.infer<typeof getTicketByIdSchema.params>

// Schema for getting tickets by booking ID
export const getTicketsByBookingIdSchema = {
  params: z.object({
    bookingId: objectIdSchema
  }),
  query: z.object({
    ...paginationParams
  })
}
export type getTicketsByBookingIdTypeParams = z.infer<typeof getTicketsByBookingIdSchema.params>
export type getTicketsByBookingIdTypeQuery = z.infer<typeof getTicketsByBookingIdSchema.query>

// Schema for getting tickets by flight ID
export const getTicketsByFlightIdSchema = {
  params: z.object({
    flightId: objectIdSchema
  }),
  query: z.object({
    ...paginationParams
  })
}
export type getTicketsByFlightIdTypeParams = z.infer<typeof getTicketsByFlightIdSchema.params>
export type getTicketsByFlightIdTypeQuery = z.infer<typeof getTicketsByFlightIdSchema.query>

export const getTicketStatsSchema = {
  params: z.object({
    flightId: objectIdSchema
  })
}
export type getTicketStatsTypeParams = z.infer<typeof getTicketStatsSchema.params>

// Schema for getting available seats
export const getAvailableSeatsSchema = {
  params: z.object({
    flightId: objectIdSchema
  })
}
export type getAvailableSeatsTypeParams = z.infer<typeof getAvailableSeatsSchema.params>

// Schema for getting booked seats
export const getBookedSeatsSchema = {
  params: z.object({
    flightId: objectIdSchema
  })
}
export type getBookedSeatsTypeParams = z.infer<typeof getBookedSeatsSchema.params>

// Schema for checking if ticket can be cancelled
export const canCancelTicketSchema = {
  params: z.object({
    ticketId: objectIdSchema
  })
}
export type canCancelTicketTypeParams = z.infer<typeof canCancelTicketSchema.params>

// Schema for getting passenger tickets
export const getPassengerTicketsSchema = {
  params: z.object({
    passengerEmail: z.string().email('Invalid email format')
  }),
  query: z.object({
    ...paginationParams
  })
}
export type getPassengerTicketsTypeParams = z.infer<typeof getPassengerTicketsSchema.params>
export type getPassengerTicketsTypeQuery = z.infer<typeof getPassengerTicketsSchema.query>

// Schema for updating multiple tickets status
export const updateMultipleTicketsStatusSchema = {
  body: z.object({
    ticketIds: z.array(objectIdSchema),
    status: z.nativeEnum(TicketStatus)
  })
}
export type updateMultipleTicketsStatusTypeBody = z.infer<typeof updateMultipleTicketsStatusSchema.body>
