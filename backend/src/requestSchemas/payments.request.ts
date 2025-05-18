import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { PaymentMethod, PaymentStatus } from '~/constants/payments'
const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const getListPaymentSchema = {
  query: z.object({
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    order: z.string().optional(),
    select: z.array(z.string()).optional()
  })
}
export type getListPaymentTypeQuery = z.infer<typeof getListPaymentSchema.query>

export const PaginationParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  order: z.enum(['asc', 'desc']).default('asc'),
  sortBy: z.enum(['amount', 'status', 'paymentMethod']).default('amount')
})
export type PaginationParamsType = z.infer<typeof PaginationParams>

export const paymentMoMoSchema = z.object({
  bookingId: objectIdSchema,
  userId: objectIdSchema,
  amount: z.number().min(1000, 'Số tiền phải lớn hơn 1000').max(20000000, 'Số tiền phải nhỏ hơn 20000000').optional(),
  orderId: z.string().min(1, 'Mã đơn hàng không được để trống').optional(),
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

export const paymentSchema = z.object({
  bookingId: objectIdSchema,
  userId: objectIdSchema,
  amount: z.number().min(1000, 'Số tiền phải lớn hơn 1000').max(20000000, 'Số tiền phải nhỏ hơn 20000000'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionId: z.string().optional(),
  orderId: z.string().min(1, 'Mã đơn hàng không được spep trống'),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  paymentDate: z.coerce.date().default(() => new Date()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export const updatePaymentSchema = {
  body: z.object({ status: z.nativeEnum(PaymentStatus) }),
  params: z.object({ paymentId: objectIdSchema })
}
export type UpdatePaymentBodyType = z.infer<typeof updatePaymentSchema.body>
export type UpdatePaymentParamsType = z.infer<typeof updatePaymentSchema.params>

export const getPaymentByIdSchema = {
  params: z.object({ paymentId: objectIdSchema })
}
export type GetPaymentByIdParamsType = z.infer<typeof getPaymentByIdSchema.params>
