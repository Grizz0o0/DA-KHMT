import authApiRequest from '@/app/apiRequests/auth';
import { getExpireAt } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;
    const userId = cookieStore.get('userId')?.value;

    if (!refreshToken || !userId) {
        return Response.json(
            { message: 'Không tìm thấy refreshToken' },
            { status: 401 }
        );
    }
    try {
        const { payload } = await authApiRequest.sRefreshToken({
            userId,
            refreshToken,
        });
        const accessToken = payload.metadata.tokens.accessToken;
        const accessTokenExp = getExpireAt(accessToken);
        const refreshTokenExp = getExpireAt(
            payload.metadata.tokens.refreshToken
        );
        const role = payload.metadata.user.role;
        const verify = payload.metadata.user.verify;
        cookieStore.set('accessToken', accessToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            expires: accessTokenExp,
        });

        cookieStore.set('refreshToken', payload.metadata.tokens.refreshToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            expires: refreshTokenExp,
        });

        cookieStore.set('userId', userId, {
            path: '/',
            sameSite: 'lax',
            secure: true,
            expires: accessTokenExp,
        });

        cookieStore.set('role', role, {
            path: '/',
            sameSite: 'lax',
            secure: true,
            expires: accessTokenExp,
        });
        cookieStore.set('verify', String(verify), {
            path: '/',
            sameSite: 'lax',
            secure: true,
            expires: accessTokenExp,
        });
        return Response.json(payload);
    } catch (error) {
        console.error('Refresh token route error:', error);
        return new Response(
            JSON.stringify({ message: 'Refresh token failed' }),
            {
                status: 500,
            }
        );
    }
}
