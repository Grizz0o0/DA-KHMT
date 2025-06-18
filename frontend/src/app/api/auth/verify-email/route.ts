import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import authApiRequest from '@/app/apiRequests/auth';
import { VerifyEmailRegisterReqBodyType } from '@/schemaValidations/users.schema';

export async function POST(request: Request) {
    const body = (await request.json()) as VerifyEmailRegisterReqBodyType;
    const cookieStore = await cookies();

    try {
        const { payload } = await authApiRequest.sVerifyEmailRegister(body);
        cookieStore.set('verify', '1', {
            path: '/',
            sameSite: 'lax',
            secure: true,
            expires: new Date(payload.metadata.exp * 1000),
        });
        return NextResponse.json({
            message: 'Xác thực thành công!',
            userId: payload.metadata.userId,
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Xác thực thất bại.' },
            { status: 400 }
        );
    }
}
