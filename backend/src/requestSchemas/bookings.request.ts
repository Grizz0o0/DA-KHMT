import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { BookingStatus, PaymentStatus } from '~/constants/bookings'

const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const createBookingSchema = {
  body: z.object({
    userId: objectIdSchema,
    flightId: objectIdSchema,
    bookingTime: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    totalPrice: z.coerce.number().nonnegative('Tổng tiền phải lớn hơn hoặc bằng 0')
  })
}

export type CreateBookingTypeBody = z.infer<typeof createBookingSchema.body>

export const updateBookingSchema = {
  params: z.object({
    bookingId: objectIdSchema
  }),
  body: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    totalPrice: z.coerce.number().nonnegative('Tổng tiền phải lớn hơn hoặc bằng 0').optional()
  })
}

export type UpdateBookingTypeParams = z.infer<typeof updateBookingSchema.params>
export type UpdateBookingTypeBody = z.infer<typeof updateBookingSchema.body>

export const deleteBookingSchema = {
  params: z.object({
    bookingId: objectIdSchema
  })
}

export type DeleteBookingTypeParams = z.infer<typeof deleteBookingSchema.params>

export const searchBookingsSchema = {
  query: z.object({
    userId: objectIdSchema.optional(),
    flightId: objectIdSchema.optional(),
    status: z.nativeEnum(BookingStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    sortBy: z.enum(['bookingTime', 'totalPrice']).optional().default('bookingTime'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  })
}

export type SearchBookingsTypeQuery = z.infer<typeof searchBookingsSchema.query>

export const getBookingByIdSchema = {
  params: z.object({
    bookingId: objectIdSchema
  })
}

export type GetBookingByIdTypeParams = z.infer<typeof getBookingByIdSchema.params>
