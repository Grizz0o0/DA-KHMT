import http from '@/lib/http';
import {
    LoginOAuthReqBodyType,
    LoginReqBodyType,
    LoginResType,
    RefreshTokenResBodyType,
    RegisterReqBodyType,
    RegisterResType,
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
        console.log(body);
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
};

export default authApiRequest;
