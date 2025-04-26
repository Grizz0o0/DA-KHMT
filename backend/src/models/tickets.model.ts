import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { TicketStatus } from '~/constants/tickets'

// ObjectId schema for MongoDB
const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

const passengerSchema = z.object({
  name: z.string().min(1, 'Passenger name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other']),
  nationality: z.string().min(1, 'Nationality is required'),
  passportNumber: z.string().optional(),
  idNumber: z.string().optional()
})

export const ticketSchema = z.object({
  _id: objectIdSchema.default(() => new ObjectId()),
  bookingId: objectIdSchema,
  userId: objectIdSchema,
  flightId: objectIdSchema,
  seatClass: z.enum(['economy', 'business', 'firstClass']),
  seatNumber: z.string().min(1, 'Số ghế không được để trống'),
  passenger: passengerSchema,
  price: z.coerce.number().nonnegative('Giá vé phải lớn hơn hoặc bằng 0'),
  status: z.nativeEnum(TicketStatus).default(TicketStatus.Unused),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type TicketType = z.infer<typeof ticketSchema>
