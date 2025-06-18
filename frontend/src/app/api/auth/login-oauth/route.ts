import { getExpireAt } from '@/lib/utils';
import { LoginOAuthReqBodyType } from '@/schemaValidations/users.schema';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const body = (await request.json()) as LoginOAuthReqBodyType;
    const cookieStore = await cookies();
    try {
        const { accessToken, refreshToken, userId, role, verify } = body;
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
        return Response.json(body);
    } catch (error) {
        console.error('Login route error:', error);
        return new Response(JSON.stringify({ message: 'Login failed' }), {
            status: 500,
        });
    }
}
