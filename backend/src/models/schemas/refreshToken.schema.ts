import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const refreshTokenSchema = z.object({
  _id: z.string().default(() => new ObjectId().toHexString()),
  userId: z.instanceof(ObjectId).transform((val) => new ObjectId(val)),
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
