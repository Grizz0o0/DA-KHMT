import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { PaymentMethod } from '~/constants/payments'
const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const paymentMoMoSchema = z.object({
  bookingId: objectIdSchema,
  userId: objectIdSchema,
  amount: z.number().min(1000, 'Số tiền phải lớn hơn 1000').max(20000000, 'Số tiền phải nhỏ hơn 20000000'),
  orderId: z.string().min(1, 'Mã đơn hàng không được để trống'),
  orderInfo: z
    .string()
    .min(1, 'Thông tin đơn hàng không được để trống')
    .max(100, 'Thông tin đơn hàng không được vượt quá 100 ký tự'),
  lang: z.enum(['vi', 'en']).default('vi'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.MOMO)
})
export type paymentMoMoSchemaType = z.infer<typeof paymentMoMoSchema>

export const momoCallbackSchema = z.object({
  partnerCode: z.string(),
  orderId: z.string(),
  requestId: z.string(),
  amount: z.number(),
  orderInfo: z.string(),
  orderType: z.string(),
  transId: z.number(),
  resultCode: z.number(),
  message: z.string(),
  payType: z.string(),
  responseTime: z.number(),
  extraData: z.string(),
  signature: z.string()
})
export type MomoCallbackSchemaType = z.infer<typeof momoCallbackSchema>
