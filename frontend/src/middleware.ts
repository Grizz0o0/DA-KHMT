import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const adminOnlyPaths = ['/manage'];
const authRequiredPaths = ['/profile', '/booking-history'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const role = request.cookies.get('role')?.value;
    const isAuth = request.cookies.get('accessToken')?.value;
    const isAdmin = role === 'admin';

    if (adminOnlyPaths.some((path) => pathname.startsWith(path) && !isAdmin))
        return NextResponse.redirect(new URL('/', request.url));

    if (authRequiredPaths.some((path) => pathname.startsWith(path)) && !isAuth)
        return NextResponse.redirect(new URL('/', request.url));

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/manage/:path*', '/booking-history/:path*', '/profile/:path*'],
};
