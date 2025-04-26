import { z } from 'zod'
import { ObjectId } from 'mongodb'

// ObjectId schema for MongoDB
const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const refreshTokenSchema = z.object({
  _id: objectIdSchema.default(() => new ObjectId()),
  userId: objectIdSchema,
  refreshToken: z.string().optional(),
  refreshTokened: z.array(z.string()).optional().default([]),
  expiresAt: z
    .date()
    .optional()
    .default(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type RefreshTokenType = z.infer<typeof refreshTokenSchema>
