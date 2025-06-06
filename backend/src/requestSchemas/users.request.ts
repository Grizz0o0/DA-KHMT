import { z } from 'zod'
import { HEADER } from '~/constants/auth'
import { UserAuthProvider, UserGender, UserVerifyStatus } from '~/constants/users'
import databaseService from '~/services/database.services'

const strongPasswordSchema = z
  .string({ required_error: 'Mật khẩu không được để trống' })
  .trim()
  .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
  .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /[^a-zA-Z0-9]/.test(value), {
    message: 'Mật khẩu phải có ít nhất 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 ký tự đặc biệt'
  })

export const PaginationParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  order: z.enum(['asc', 'desc']).default('asc'),
  sortBy: z.enum(['departureTime', 'arrivalTime', 'price', 'availableSeats']).default('departureTime')
})
export type PaginationParamsType = z.infer<typeof PaginationParams>

export const loginSchema = {
  body: z.object({
    email: z
      .string({ required_error: 'Email không được để trống' })
      .email('Email không hợp lệ')
      .trim()
      .refine(
        async (email) => {
          const isExistEmail = await databaseService.users.findOne({ email })
          return !!isExistEmail
        },
        { message: 'Email chưa được đăng ký' }
      ),
    password: strongPasswordSchema
  })
}
export type loginReqBodyType = z.infer<typeof loginSchema.body>

export const registerSchema = {
  body: z
    .object({
      username: z
        .string({ required_error: 'Tên người dùng không được để trống' })
        .trim()
        .min(1, 'Tên người dùng phải có từ 1 đến 255 ký tự')
        .max(255),
      email: z.string({ required_error: 'Email không được để trống' }).trim().email('Email không hợp lệ'),
      phoneNumber: z
        .string({ required_error: 'Số điện thoại không được để trống' })
        .trim()
        .regex(/^(03|05|07|08|09)[0-9]{8}$/, 'Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam hợp lệ'),
      password: strongPasswordSchema,
      confirm_password: z.string({ required_error: 'Xác nhận mật khẩu không được để trống' })
    })
    .refine((data) => data.password === data.confirm_password, {
      message: 'Xác nhận mật khẩu không khớp',
      path: ['confirm_password']
    })
}
export type registerReqBodyType = z.infer<typeof registerSchema.body>

export const registerGoogleSchema = z.object({
  username: z.string().min(1).max(255),
  email: z.string().trim().email('Email không hợp lệ'),
  password: strongPasswordSchema,
  avatar: z.string().optional(),
  authProvider: z.enum([UserAuthProvider.Google, UserAuthProvider.Facebook]), // Enum từ constants
  verify: z.nativeEnum(UserVerifyStatus)
})
export type registerGoogleReqBodyType = z.infer<typeof registerGoogleSchema>

export const forgotPasswordSchema = {
  body: z.object({
    email: z
      .string({
        required_error: 'Email không được để trống'
      })
      .trim()
      .email('Email không hợp lệ')
      .refine(
        async (email) => {
          const exists = await databaseService.users.findOne({ email })
          return Boolean(exists)
        },
        {
          message: 'Email chưa được đăng ký'
        }
      )
  })
}
export type forgotPasswordReqBodyType = z.infer<typeof forgotPasswordSchema.body>

export const verifyForgotPasswordSchema = {
  body: z.object({
    forgotPasswordToken: z
      .string({
        required_error: 'forgotPasswordToken không được để trống'
      })
      .trim(),
    email: z
      .string({
        required_error: 'Email không được để trống'
      })
      .trim()
      .email('Email không hợp lệ')
      .refine(
        async (email) => {
          const exists = await databaseService.users.findOne({ email })
          return Boolean(exists)
        },
        {
          message: 'Email chưa được đăng ký'
        }
      )
  })
}
export type verifyForgotPasswordReqBodyType = z.infer<typeof verifyForgotPasswordSchema.body>

export const resetPasswordSchema = {
  body: z
    .object({
      password: strongPasswordSchema,
      confirm_password: z
        .string({
          required_error: 'Xác nhận mật khẩu không được để trống'
        })
        .trim(),
      forgotPasswordToken: z
        .string({
          required_error: 'forgotPasswordToken không được để trống'
        })
        .trim()
    })
    .refine((data) => data.password === data.confirm_password, {
      message: 'Xác nhận mật khẩu không khớp',
      path: ['confirm_password']
    })
}
export type resetPasswordReqBodyType = z.infer<typeof resetPasswordSchema.body>

export const changePasswordSchema = {
  body: z
    .object({
      password: strongPasswordSchema,
      newPassword: strongPasswordSchema,
      confirm_newPassword: z
        .string({
          required_error: 'Xác nhận mật khẩu không được để trống'
        })
        .trim()
    })
    .refine((data) => data.newPassword === data.confirm_newPassword, {
      message: 'Xác nhận mật khẩu không khớp',
      path: ['confirm_newPassword']
    })
}
export type changePasswordReqBodyType = z.infer<typeof changePasswordSchema.body>

export const deleteUserSchema = {
  params: z.object({
    id: z.string().trim().min(1, {
      message: 'Id không được để trống'
    })
  })
}
export type deleteUserReqParamsType = z.infer<typeof deleteUserSchema.params>

export const getUserByIdSchema = {
  params: z.object({
    id: z
      .string()
      .trim()
      .min(1, {
        message: `Headers[${HEADER.AUTHORIZATION}] không được để trống`
      })
  })
}
export type getUserByIdReqParamsType = z.infer<typeof getUserByIdSchema.params>

export const updateMeSchema = {
  body: z.object({
    username: z
      .string({ required_error: 'Tên người dùng không được để trống' })
      .min(1, 'Tên người dùng phải có từ 1 đến 255 ký tự')
      .max(255, 'Tên người dùng phải có từ 1 đến 255 ký tự')
      .trim()
      .optional(),
    email: z.string({ invalid_type_error: 'Email phải là chuỗi' }).email('Email không hợp lệ').trim().optional(),
    avatar: z.string({ invalid_type_error: 'Avatar phải là chuỗi' }).trim().optional(),
    coverPhoto: z.string({ invalid_type_error: 'Cover photo phải là chuỗi' }).trim().optional(),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam hợp lệ')
      .optional(),
    dateOfBirth: z
      .union([z.string(), z.date()])
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    gender: z.nativeEnum(UserGender).optional(),
    address: z.string({ invalid_type_error: 'Địa chỉ phải là chuỗi' }).trim().optional()
  }),
  params: z.object({
    id: z
      .string()
      .trim()
      .min(1, {
        message: `Headers[${HEADER.AUTHORIZATION}] không được để trống`
      })
  })
}
export type updateMeReqBodyType = z.infer<typeof updateMeSchema.body>

export const authenticationV2Schema = z.object({
  [HEADER.REFRESHTOKEN]: z
    .string({
      required_error: `Headers[${HEADER.REFRESHTOKEN}] không được để trống`
    })
    .trim(),
  [HEADER.CLIENT_ID]: z
    .string({
      required_error: `Headers[${HEADER.CLIENT_ID}] không được để trống`
    })
    .trim()
})

export const authenticationSchema = z.object({
  [HEADER.AUTHORIZATION]: z
    .string({
      required_error: `Headers[${HEADER.AUTHORIZATION}] không được để trống`
    })
    .trim(),
  [HEADER.CLIENT_ID]: z
    .string({
      required_error: `Headers[${HEADER.CLIENT_ID}] không được để trống`
    })
    .trim()
})

export const getListUserSchema = {
  query: z.object({
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    order: z.string().optional(),
    select: z.array(z.string()).optional()
  })
}

export type getListUserTypeQuery = z.infer<typeof getListUserSchema.query>
