import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { BookingStatus, PaymentStatus } from '~/constants/bookings'

const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const bookingSchema = z.object({
  _id: objectIdSchema.default(() => new ObjectId()),
  userId: z.instanceof(ObjectId).transform((val) => new ObjectId(val)),
  flightId: z.instanceof(ObjectId).transform((val) => new ObjectId(val)),
  bookingTime: z.coerce.date(),
  status: z.nativeEnum(BookingStatus).default(BookingStatus.Pending),
  totalPrice: z.coerce.number().nonnegative('Tổng tiền phải lớn hơn hoặc bằng 0'),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.Unpaid),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type BookingType = z.infer<typeof bookingSchema>
