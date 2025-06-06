import { UserGender, UserRole } from '@/constants/users';
import { z } from 'zod';

export const objectIdStringSchema = z
    .string()
    .length(24, 'ObjectId phải dài 24 ký tự')
    .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

export const PaginationParams = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    order: z.enum(['asc', 'desc']).default('asc'),
    sortBy: z
        .enum(['username', 'email', 'phoneNumber', 'createdAt', 'updatedAt'])
        .default('username'),
});
export type PaginationParamsType = z.infer<typeof PaginationParams>;

const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
});

export const BasicUserSchema = z.object({
    _id: z.string(),
    username: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
    role: z.enum(['user', 'admin']),
});

export const FullUserSchema = BasicUserSchema.extend({
    dateOfBirth: z.string().nullable(),
    gender: z.nativeEnum(UserGender),
    address: z.string(),
    avatar: z.string(),
    coverPhoto: z.string(),
    role: z.nativeEnum(UserRole),
    tickets: z.array(z.any()),
});

export const TokensSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string(),
});

const StrongPasswordSchema = z
    .string({ required_error: 'Mật khẩu không được để trống' })
    .trim()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .refine(
        (value) =>
            /[a-z]/.test(value) &&
            /[A-Z]/.test(value) &&
            /[^a-zA-Z0-9]/.test(value),
        {
            message:
                'Mật khẩu phải có ít nhất 1 chữ cái viết thường, 1 chữ cái viết hoa, 1 ký tự đặc biệt',
        }
    );

export const LoginOAuthSchemaBody = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    userId: z.string(),
    role: z.nativeEnum(UserRole),
});
export type LoginOAuthReqBodyType = z.infer<typeof LoginOAuthSchemaBody>;
export const LoginSchemaBody = z.object({
    email: z
        .string({ required_error: 'Email không được để trống' })
        .email('Email không hợp lệ')
        .trim(),
    password: StrongPasswordSchema,
});
export const LoginResponseSchema = BaseResponseSchema.extend({
    metadata: z.object({
        user: BasicUserSchema,
        tokens: TokensSchema,
    }),
});
export type LoginReqBodyType = z.infer<typeof LoginSchemaBody>;
export type LoginResType = z.infer<typeof LoginResponseSchema>;

export const RegisterSchemaBody = z
    .object({
        username: z
            .string({ required_error: 'Tên người dùng không được để trống' })
            .trim()
            .min(1, 'Tên người dùng phải có từ 1 đến 255 ký tự')
            .max(255, 'Tên người dùng phải có từ 1 đến 255 ký tự'),
        email: z
            .string({ required_error: 'Email không được để trống' })
            .email('Email không hợp lệ')
            .trim(),
        phoneNumber: z
            .string({ required_error: 'Số điện thoại không được để trống' })
            .trim()
            .regex(
                /^(03|05|07|08|09)[0-9]{8}$/,
                'Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam hợp lệ'
            ),
        password: StrongPasswordSchema,
        confirm_password: z
            .string({ required_error: 'Xác nhận mật khẩu không được để trống' })
            .trim(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: 'Xác nhận mật khẩu không khớp',
        path: ['confirm_password'],
    });

export const RegisterResponseSchema = BaseResponseSchema.extend({
    metadata: z.object({
        user: BasicUserSchema,
        tokens: TokensSchema,
    }),
});
export type RegisterReqBodyType = z.infer<typeof RegisterSchemaBody>;
export type RegisterResType = z.infer<typeof RegisterResponseSchema>;

export const ForgotPasswordSchemaBody = z.object({
    email: z
        .string({ required_error: 'Email không được để trống' })
        .email('Email không hợp lệ')
        .trim(),
});
export type ForgotPasswordReqBodyType = z.infer<
    typeof ForgotPasswordSchemaBody
>;

export const VerifyForgotPasswordSchemaBody = z.object({
    forgotPasswordToken: z
        .string({ required_error: 'forgotPasswordToken không được để trống' })
        .trim(),
    email: z
        .string({ required_error: 'Email không được để trống' })
        .email('Email không hợp lệ')
        .trim(),
});
export type VerifyForgotPasswordReqBodyType = z.infer<
    typeof VerifyForgotPasswordSchemaBody
>;

export const ResetPasswordSchemaBody = z
    .object({
        password: StrongPasswordSchema,
        confirm_password: z
            .string({ required_error: 'Xác nhận mật khẩu không được để trống' })
            .trim(),
        forgotPasswordToken: z
            .string({
                required_error: 'forgotPasswordToken không được để trống',
            })
            .trim(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: 'Xác nhận mật khẩu không khớp',
        path: ['confirm_password'],
    });
export type ResetPasswordReqBodyType = z.infer<typeof ResetPasswordSchemaBody>;

export const UpdateMeReqBody = z.object({
    username: z
        .string()
        .min(1, 'Tên người dùng phải có từ 1 đến 255 ký tự')
        .max(255)
        .optional(),
    email: z.string().email('Email không hợp lệ').optional(),
    avatar: z.string().optional(),
    coverPhoto: z.string().optional(),
    phoneNumber: z
        .string()
        .regex(
            /^(0|\+84)[0-9]{9}$/,
            'Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam hợp lệ'
        )
        .optional(),
    dateOfBirth: z.union([z.string(), z.date()]).optional(),
    gender: z.nativeEnum(UserGender).optional(),
    address: z.string().optional(),
});
export type UpdateMeReqBodyType = z.infer<typeof UpdateMeReqBody>;

export const UpdateMeResBody = BaseResponseSchema.extend({
    metadata: z.object({
        user: FullUserSchema,
    }),
});
export type UpdateMeResBodyType = z.infer<typeof UpdateMeResBody>;

export const MeResBody = BaseResponseSchema.extend({
    metadata: z.object({
        user: FullUserSchema,
    }),
});
export type MeResBodyType = z.infer<typeof MeResBody>;

export const ChangePasswordReqBody = z
    .object({
        password: StrongPasswordSchema,
        newPassword: StrongPasswordSchema,
        confirm_newPassword: z
            .string({
                required_error: 'Xác nhận mật khẩu không được để trống',
            })
            .trim(),
    })
    .refine((data) => data.newPassword === data.confirm_newPassword, {
        message: 'Xác nhận mật khẩu không khớp',
        path: ['confirm_newPassword'],
    });
export type ChangePasswordReqBodyType = z.infer<typeof ChangePasswordReqBody>;

export const ChangePasswordResSchema = BaseResponseSchema.extend({
    metadata: BasicUserSchema,
});
export type ChangePasswordResBodyType = z.infer<typeof ChangePasswordResSchema>;

export const RefreshTokenResType = BaseResponseSchema.extend({
    metadata: z.object({
        user: BasicUserSchema,
        tokens: TokensSchema.extend({
            refreshTokenUsed: z.array(z.string()),
        }),
    }),
});

export type RefreshTokenResBodyType = z.infer<typeof RefreshTokenResType>;

export const GetListUserResType = BaseResponseSchema.extend({
    metadata: z.object({
        users: z.array(
            z.object({
                _id: objectIdStringSchema,
                username: z.string(),
                email: z.string(),
                phoneNumber: z.string(),
                gender: z.nativeEnum(UserGender),
                dateOfBirth: z.string(),
                address: z.string(),
                avatar: z.string(),
            })
        ),
        pagination: PaginationSchema,
    }),
});
export type GetListUserResBodyType = z.infer<typeof GetListUserResType>;
