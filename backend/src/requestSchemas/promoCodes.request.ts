import { z } from 'zod'
import { ObjectId } from 'mongodb'

const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const createPromoCodeSchema = {
  body: z.object({
    code: z
      .string()
      .min(1)
      .transform((val) => val.trim().toUpperCase()),
    discountPercentage: z.number().min(1).max(100).optional(),
    discountAmount: z.number().min(1000).optional(),
    description: z.string().max(255).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    maxUsage: z.number().min(1).optional(),
    usedCount: z.number().default(0)
  })
}

export type CreatePromoCodeType = z.infer<typeof createPromoCodeSchema.body>

export const updatePromoCodeSchema = {
  body: z
    .object({
      description: z.string().max(255).optional(),
      discountPercentage: z.number().min(1).max(100).optional(),
      discountAmount: z.number().min(1000).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      maxUsage: z.number().min(1).optional(),
      isActive: z.boolean().optional()
    })
    .superRefine((data, ctx) => {
      if (data.endDate && data.startDate && data.endDate < data.startDate) {
        ctx.addIssue({
          path: ['endDate'],
          code: z.ZodIssueCode.custom,
          message: 'Ngày kết thúc phải sau ngày bắt đầu'
        })
      }
    }),
  params: z.object({
    id: objectIdSchema
  })
}

export type UpdatePromoCodeType = z.infer<typeof updatePromoCodeSchema.body>

export const deactivatePromoCodeSchema = {
  params: z.object({
    id: objectIdSchema
  })
}

export type DeactivatePromoCodeTypeParams = z.infer<typeof deactivatePromoCodeSchema.params>

export const getPromoCodeByIdSchema = {
  params: z.object({
    id: objectIdSchema
  })
}

export type GetPromoCodeByIdTypeParams = z.infer<typeof getPromoCodeByIdSchema.params>

export const getPromoCodeByCodeSchema = {
  params: z.object({
    code: z
      .string()
      .min(1)
      .transform((val) => val.trim().toUpperCase())
  })
}

export type GetPromoCodeByCodeTypeParams = z.infer<typeof getPromoCodeByCodeSchema.params>

export const usePromoCodeSchema = {
  params: z.object({
    code: z
      .string()
      .min(1)
      .transform((val) => val.trim().toUpperCase())
  })
}

export type UsePromoCodeTypeParams = z.infer<typeof usePromoCodeSchema.params>

export const validatePromoCodeSchema = {
  params: z.object({
    code: z
      .string()
      .min(1)
      .transform((val) => val.trim().toUpperCase())
  })
}

export type ValidatePromoCodeTypeParams = z.infer<typeof validatePromoCodeSchema.params>
