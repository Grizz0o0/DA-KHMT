import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { PaymentMethod, PaymentStatus } from '~/constants/payments'

const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const paymentSchema = z.object({
  _id: objectIdSchema.default(() => new ObjectId()),
  bookingId: objectIdSchema,
  userId: objectIdSchema,
  amount: z.number().min(1000, 'Số tiền phải lớn hơn 1000').max(20000000, 'Số tiền phải nhỏ hơn 20000000'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionId: z.string().optional(),
  orderId: z.string().min(1, 'Mã đơn hàng không được để trống'),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  paymentDate: z.coerce.date().default(() => new Date()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type PaymentType = z.infer<typeof paymentSchema>
