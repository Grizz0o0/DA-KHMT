import { z } from 'zod'
import { HEADER } from '~/constants/auth'
import { UserGender } from '~/constants/users'
import databaseService from '~/services/database.services'

const strongPasswordSchema = z
  .string({ required_error: 'Mật khẩu không được để trống' })
  .trim()
  .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
  .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /[^a-zA-Z0-9]/.test(value), {
    message: 'Mật khẩu phải có ít nhất 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 ký tự đặc biệt'
  })

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
      email: z
        .string({ required_error: 'Email không được để trống' })
        .trim()
        .email('Email không hợp lệ')
        .refine(
          async (email) => {
            const isExist = await databaseService.users.findOne({ email })
            return !isExist
          },
          { message: 'Email đã tồn tại' }
        ),
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

export const logoutSchema = {
  headers: z.object({
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
}
export type logoutReqHeadersType = z.infer<typeof logoutSchema.headers>

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
  headers: z.object({
    [HEADER.AUTHORIZATION]: z
      .string()
      .trim()
      .min(1, {
        message: `Headers[${HEADER.AUTHORIZATION}] không được để trống`
      }),
    [HEADER.CLIENT_ID]: z
      .string()
      .trim()
      .min(1, {
        message: `Headers[${HEADER.CLIENT_ID}] không được để trống`
      })
  }),
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
      .string()
      .trim()
      .refine((val) => !isNaN(Date.parse(val)), 'Ngày sinh phải có định dạng ISO8601')
      .optional(),
    gender: z
      .string({ invalid_type_error: 'Giới tính phải là chuỗi' })
      .trim()
      .refine((val) => Object.values(UserGender).includes(val as UserGender), 'Giới tính không hợp lệ')
      .optional(),
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
