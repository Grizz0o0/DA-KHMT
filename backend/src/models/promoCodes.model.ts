import { z } from 'zod'
import { ObjectId } from 'mongodb'

const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const promoSchema = z
  .object({
    _id: objectIdSchema.default(() => new ObjectId()),
    code: z
      .string()
      .min(1)
      .transform((val) => val.trim().toUpperCase()),
    discountPercentage: z.number().min(1).max(100).optional(),
    discountAmount: z.number().min(1000).optional(), // giảm theo số tiền (nếu áp dụng loại này)
    description: z.string().max(255).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    maxUsage: z.number().min(1).optional(), // tổng số lượt sử dụng cho mã này
    usedCount: z.number().default(0), // số lần đã dùng
    isActive: z.boolean().default(true), // để tắt/bật mã
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date())
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        path: ['endDate'],
        code: z.ZodIssueCode.custom,
        message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'
      })
    }
  })

export type PromoType = z.infer<typeof promoSchema>
