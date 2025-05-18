import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { BookingStatus } from '~/constants/bookings'
import { PaymentStatus } from '~/constants/payments'
import { AircraftClass } from '~/constants/aircrafts'

const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const getListBookingSchema = {
  query: z.object({
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    order: z.enum(['asc', 'desc']).optional(),
    select: z.array(z.string()).optional()
  })
}
export type getListBookingTypeQuery = z.infer<typeof getListBookingSchema.query>

export const createBookingSchema = {
  body: z.object({
    userId: objectIdSchema,
    flightId: objectIdSchema,
    seatClass: z.nativeEnum(AircraftClass),
    quantity: z.number().int().min(1, 'Phải đặt ít nhất 1 vé'),
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
  query: z
    .object({
      userId: objectIdSchema.optional(),
      flightId: objectIdSchema.optional(),
      status: z.nativeEnum(BookingStatus).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      paymentStatus: z.nativeEnum(PaymentStatus).optional(),
      page: z.coerce.number().min(1).optional().default(1),
      limit: z.coerce.number().min(1).max(100).optional().default(10),
      sortBy: z.enum(['status', 'totalPrice', 'bookingTime']).optional().default('bookingTime'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    })
    .superRefine((data, ctx) => {
      if (data.startDate && data.endDate && data.startDate > data.endDate) {
        ctx.addIssue({
          path: ['endDate'],
          code: z.ZodIssueCode.custom,
          message: 'endDate phải lớn hơn hoặc bằng startDate'
        })
      }

      if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
        ctx.addIssue({
          path: ['maxPrice'],
          code: z.ZodIssueCode.custom,
          message: 'maxPrice phải lớn hơn hoặc bằng minPrice'
        })
      }
    })
}

export type SearchBookingsTypeQuery = z.infer<typeof searchBookingsSchema.query>

export const getBookingByIdSchema = {
  params: z.object({
    bookingId: objectIdSchema
  })
}

export type GetBookingByIdTypeParams = z.infer<typeof getBookingByIdSchema.params>
