import { z } from 'zod'
import { ObjectId } from 'mongodb'

const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const createRefreshTokenSchema = z.object({
  userId: objectIdSchema,
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional()
})

export type createRefreshTokenTypeBody = z.infer<typeof createRefreshTokenSchema>

export const updateRefreshTokenSchema = z.object({
  userId: objectIdSchema,
  refreshToken: z.string({ required_error: 'RefreshToken không được để trống' }),
  newRefreshToken: z.string({ required_error: 'NewRefreshToken không được để trống' }),
  newExpiresAt: z.date().optional()
})

export type updateRefreshTokenTypeBody = z.infer<typeof updateRefreshTokenSchema>

export const findByUserIdSchema = z.object({
  userId: objectIdSchema
})

export type findByUserIdTypeParams = z.infer<typeof findByUserIdSchema>

export const findByRefreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'RefreshToken không được để trống' })
})

export type findByRefreshTokenTypeParams = z.infer<typeof findByRefreshTokenSchema>

export const deleteByUserIdSchema = z.object({
  userId: objectIdSchema
})

export type deleteByUserIdTypeParams = z.infer<typeof deleteByUserIdSchema>
