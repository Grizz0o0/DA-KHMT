import { z } from 'zod';

export const objectIdStringSchema = z
    .string()
    .length(24, 'ObjectId phải dài 24 ký tự')
    .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

export const createRefreshTokenSchema = z.object({
    userId: objectIdStringSchema,
    refreshToken: z.string().optional(),
    expiresAt: z.date().optional(),
});

export type createRefreshTokenTypeBody = z.infer<
    typeof createRefreshTokenSchema
>;

export const updateRefreshTokenSchema = z.object({
    userId: objectIdStringSchema,
    refreshToken: z.string({
        required_error: 'RefreshToken không được để trống',
    }),
    newRefreshToken: z.string({
        required_error: 'NewRefreshToken không được để trống',
    }),
    newExpiresAt: z.date().optional(),
});

export type updateRefreshTokenTypeBody = z.infer<
    typeof updateRefreshTokenSchema
>;

export const findByUserIdSchema = z.object({
    userId: objectIdStringSchema,
});

export type findByUserIdTypeParams = z.infer<typeof findByUserIdSchema>;

export const findByRefreshTokenSchema = z.object({
    refreshToken: z.string({
        required_error: 'RefreshToken không được để trống',
    }),
});

export type findByRefreshTokenTypeParams = z.infer<
    typeof findByRefreshTokenSchema
>;

export const deleteByUserIdSchema = z.object({
    userId: objectIdStringSchema,
});

export type deleteByUserIdTypeParams = z.infer<typeof deleteByUserIdSchema>;
