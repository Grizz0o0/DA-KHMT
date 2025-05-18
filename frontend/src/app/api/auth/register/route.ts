import authApiRequest from '@/app/apiRequests/auth';
import { getExpireAt, getRoleFromToken, getUserIdFromToken } from '@/lib/utils';
import { RegisterReqBodyType } from '@/schemaValidations/users.schema';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const body = (await request.json()) as RegisterReqBodyType;
    const cookieStore = await cookies();
    try {
        const { payload } = await authApiRequest.sRegister(body);
        const { accessToken, refreshToken } = payload.metadata.tokens;
        const userId = getUserIdFromToken(accessToken);
        const role = getRoleFromToken(accessToken);
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

        return Response.json(payload);
    } catch (error) {
        console.error('Register route error:', error);
        return new Response(JSON.stringify({ message: 'Register failed' }), {
            status: 500,
        });
    }
}
