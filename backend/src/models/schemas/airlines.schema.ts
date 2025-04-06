import { z } from 'zod'
import { ObjectId } from 'mongodb'

const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const airlineSchema = z.object({
  _id: objectIdSchema.default(() => new ObjectId()),
  name: z.string(),
  code: z.string(),
  logo: z.string().default(''),
  description: z.string().default(''),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type AirlineType = z.infer<typeof airlineSchema>
