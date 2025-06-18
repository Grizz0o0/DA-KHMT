import http from '@/lib/http';
import {
    ForgotPasswordResType,
    LoginOAuthReqBodyType,
    LoginReqBodyType,
    LoginResType,
    RefreshTokenResBodyType,
    RegisterReqBodyType,
    RegisterResType,
    ResetPasswordResType,
    VerifyEmailRegisterResType,
    VerifyForgotPasswordResType,
} from '@/schemaValidations/users.schema';

const authApiRequest = {
    sLogin: (body: LoginReqBodyType) =>
        http.post<LoginResType>('/v1/api/users/login', body),
    loginOAuth: (body: LoginOAuthReqBodyType) =>
        http.post<LoginResType>('/api/auth/login-oauth', body, {
            baseUrl: '',
        }),
    login: (body: LoginReqBodyType) =>
        http.post<LoginResType>('/api/auth/login', body, {
            baseUrl: '',
        }),

    sRegister: (body: RegisterReqBodyType) =>
        http.post<RegisterResType>('/v1/api/users/register', body),
    register: (body: RegisterReqBodyType) =>
        http.post<RegisterResType>('/api/auth/register', body, {
            baseUrl: '',
        }),

    sLogout: (body: { userId: string; accessToken: string }) => {
        return http.post(
            '/v1/api/users/logout',
            {},
            {
                headers: {
                    authorization: body.accessToken,
                    'x-client-id': body.userId,
                },
            }
        );
    },
    logout: () => http.post('/api/auth/logout', null, { baseUrl: '' }),

    sRefreshToken: (body: { userId: string; refreshToken: string }) =>
        http.post<RefreshTokenResBodyType>(
            '/v1/api/users/refresh-token',
            {},
            {
                headers: {
                    'x-rtoken-id': body.refreshToken,
                    'x-client-id': body.userId,
                },
            }
        ),
    refreshToken: () =>
        http.post<RefreshTokenResBodyType>('/api/auth/refresh-token', null, {
            baseUrl: '',
        }),

    sVerifyEmailRegister: (body: { verifyEmailToken: string; email: string }) =>
        http.post<VerifyEmailRegisterResType>(
            '/v1/api/users/verify-email',
            body
        ),

    verifyEmailRegister: (body: { verifyEmailToken: string; email: string }) =>
        http.post<VerifyEmailRegisterResType>('/api/auth/verify-email', body, {
            baseUrl: '',
        }),

    verifyForgotPassword: (body: {
        forgotPasswordToken: string;
        email: string;
    }) =>
        http.post<VerifyForgotPasswordResType>(
            '/v1/api/users/verify-forgot-password',
            body
        ),

    forgotPassword: (body: { email: string }) =>
        http.post<ForgotPasswordResType>('/v1/api/users/forgot-password', body),

    resetPassword: (body: { forgotPasswordToken: string; password: string }) =>
        http.post<ResetPasswordResType>('/v1/api/users/reset-password', body),

    resendVerifyEmail: (body: { email: string }) =>
        http.post<VerifyForgotPasswordResType>(
            '/v1/api/users/resend-verify-email',
            body
        ),

    resendVerifyForgotPassword: (body: { email: string }) =>
        http.post<ForgotPasswordResType>(
            '/v1/api/users/resend-verify-password',
            body
        ),
};

export default authApiRequest;
