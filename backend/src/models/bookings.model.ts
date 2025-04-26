import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { BookingStatus } from '~/constants/bookings'
import { AircraftClass } from '~/constants/aircrafts'
import { PaymentStatus } from '~/constants/payments'
const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const bookingSchema = z.object({
  _id: objectIdSchema.default(() => new ObjectId()),
  userId: objectIdSchema,
  flightId: objectIdSchema,
  seatClass: z.nativeEnum(AircraftClass),
  bookingTime: z.date().default(() => new Date()),
  quantity: z.number().int().min(1, 'Phải đặt ít nhất 1 vé'),
  totalPrice: z.coerce.number().nonnegative('Tổng tiền phải lớn hơn hoặc bằng 0'),
  status: z.nativeEnum(BookingStatus).default(BookingStatus.Pending),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type BookingType = z.infer<typeof bookingSchema>
