import authApiRequest from '@/app/apiRequests/auth';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = cookies();

    // 1. Đọc token & userId trước khi xoá
    const accessToken = (await cookieStore).get('accessToken')?.value;
    const userId = (await cookieStore).get('userId')?.value;

    // 2. Xoá toàn bộ cookie liên quan
    ['accessToken', 'refreshToken', 'userId', 'role'].forEach(async (key) => {
        (await cookieStore).delete(key);
    });

    // 3. Nếu thiếu thông tin, vẫn trả 200 – logout là idempotent
    if (!accessToken || !userId) {
        return Response.json({ message: 'Đã đăng xuất' }, { status: 200 });
    }

    // 4. Gọi backend để huỷ refresh token
    try {
        const result = await authApiRequest.sLogout({ accessToken, userId });
        return Response.json({
            message: 'Đăng xuất thành công',
            metadata: result.payload,
        });
    } catch (error) {
        console.error('Logout route error:', error);
        return Response.json(
            { message: 'Đăng xuất thất bại từ server backend' },
            { status: 500 }
        );
    }
}
