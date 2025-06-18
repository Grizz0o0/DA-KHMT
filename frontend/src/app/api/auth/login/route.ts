import authApiRequest from '@/app/apiRequests/auth';
import { getExpireAt, getUserIdFromToken } from '@/lib/utils';
import { LoginReqBodyType } from '@/schemaValidations/users.schema';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const body = (await request.json()) as LoginReqBodyType;
    const cookieStore = await cookies();
    try {
        const { payload } = await authApiRequest.sLogin(body);
        const { accessToken, refreshToken } = payload.metadata.tokens;
        const { role, verify } = payload.metadata.user;
        const userId = getUserIdFromToken(accessToken);
        const accessTokenExp = getExpireAt(accessToken);
        const refreshTokenExp = getExpireAt(refreshToken);

        if (!userId || !role || !accessTokenExp || !refreshTokenExp) {
            return new Response(
                JSON.stringify({ message: 'Invalid token payload' }),
                {
                    status: 400,
                }
            );
        }

        cookieStore.set('accessToken', accessToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            expires: accessTokenExp,
        });

        cookieStore.set('refreshToken', refreshToken, {
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
    } catch (error: any) {
        console.error('Login route error:', error);
        return new Response(JSON.stringify({ message: error.message }), {
            status: 500,
        });
    }
}
