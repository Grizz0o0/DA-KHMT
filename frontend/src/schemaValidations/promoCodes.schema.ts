// src/schemas/frontend/promoCode.schema.ts
import { z } from 'zod';

// ======== PAGINATION ========
export const PaginationParams = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    order: z.enum(['asc', 'desc']).default('asc'),
    sortBy: z
        .enum(['code', 'discountPercentage', 'discountAmount', 'usedCount'])
        .default('code'),
});
export type PaginationParamsType = z.infer<typeof PaginationParams>;

export const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
});

// ======== REQUEST ========

export const CreatePromoCodeReqSchema = z
    .object({
        code: z
            .string()
            .min(1)
            .transform((val) => val.trim().toUpperCase()),
        discountPercentage: z.coerce.number().min(1).max(100).optional(),
        discountAmount: z.coerce.number().min(1000).optional(),
        description: z.string().max(255).optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        maxUsage: z.coerce.number().min(1).optional(),
        usedCount: z.coerce.number().default(0).optional(),
    })
    .superRefine((data, ctx) => {
        const hasPercentage = !!data.discountPercentage;
        const hasAmount = !!data.discountAmount;

        if (!hasPercentage && !hasAmount) {
            ctx.addIssue({
                path: ['discountPercentage'],
                code: z.ZodIssueCode.custom,
                message: 'Phải nhập hoặc phần trăm giảm, hoặc giảm giá cố định',
            });
            ctx.addIssue({
                path: ['discountAmount'],
                code: z.ZodIssueCode.custom,
                message: 'Phải nhập hoặc phần trăm giảm, hoặc giảm giá cố định',
            });
        }

        if (hasPercentage && hasAmount) {
            ctx.addIssue({
                path: ['discountAmount'],
                code: z.ZodIssueCode.custom,
                message: 'Chỉ được nhập một trong hai: % hoặc cố định',
            });
        }
    });
export type CreatePromoCodeReqType = z.infer<typeof CreatePromoCodeReqSchema>;

export const UpdatePromoCodeReqSchema = z
    .object({
        description: z.string().max(255).optional(),
        discountPercentage: z.coerce.number().min(1).max(100).optional(),
        discountAmount: z.coerce.number().min(1000).optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        maxUsage: z.coerce.number().min(1).optional(),
        isActive: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.startDate && data.endDate && data.endDate < data.startDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Ngày kết thúc phải sau ngày bắt đầu',
                path: ['endDate'],
            });
        }
    });

export type UpdatePromoCodeReqType = z.infer<typeof UpdatePromoCodeReqSchema>;

export const PromoCodeParamsSchema = z.object({
    code: z
        .string()
        .min(1, 'Mã không được để trống')
        .transform((val) => val.trim().toUpperCase()),
});

export type PromoCodeParamsType = z.infer<typeof PromoCodeParamsSchema>;

export const PromoCodeIdParamsSchema = z.object({
    id: z.string().min(1, 'ID không hợp lệ'),
});

export type PromoCodeIdParamsType = z.infer<typeof PromoCodeIdParamsSchema>;

// ======== RESPONSE ========
export const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string(),
});

export const PromoCodeResSchema = z.object({
    _id: z.string(),
    code: z.string(),
    discountPercentage: z.number().optional(),
    discountAmount: z.number().optional(),
    description: z.string().optional(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    maxUsage: z.number().optional(),
    usedCount: z.number(),
    isActive: z.boolean(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type PromoCodeResType = z.infer<typeof PromoCodeResSchema>;

export const PromoCodeListResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        promocodes: z.array(PromoCodeResSchema),
        pagination: PaginationSchema,
    }),
});

export type PromoCodeListResType = z.infer<typeof PromoCodeListResSchema>;

export const PromoCodeDetailResSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    metadata: PromoCodeResSchema,
    timestamp: z.string().optional(),
});

export type PromoCodeDetailResType = z.infer<typeof PromoCodeDetailResSchema>;
