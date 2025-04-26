import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { UserGender, UserRole, UserVerifyStatus, UserAuthProvider } from '~/constants/users'

const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const userSchema = z.object({
  _id: objectIdSchema.default(() => new ObjectId()),
  username: z.string().default(''),
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z.string(),
  phoneNumber: z.string().default(''),
  dateOfBirth: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  gender: z.nativeEnum(UserGender).default(UserGender.Other),
  address: z.string().default(''),
  avatar: z.string().default(''),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  verify: z.nativeEnum(UserVerifyStatus).default(UserVerifyStatus.Unverified),
  authProvider: z.nativeEnum(UserAuthProvider).default(UserAuthProvider.Local),
  tickets: z.array(objectIdSchema).default([]),
  verifyEmailToken: z.string().default(''),
  forgotPasswordToken: z.string().default(''),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type UserType = z.infer<typeof userSchema>
