'use client';

import { useEffect } from 'react';
import { useLoginOAuthMutation } from '@/queries/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { UserRole, UserVerifyStatus } from '@/constants/users';
import { Loader2 } from 'lucide-react';
export default function OAuthCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const loginMutation = useLoginOAuthMutation();
    useEffect(() => {
        const userId = searchParams.get('userId');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const role = searchParams.get('role') as UserRole;
        const verify = UserVerifyStatus.Verified;
        if (userId && accessToken && refreshToken && role) {
            localStorage.setItem('userId', userId);
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('role', role);
            localStorage.setItem('verify', verify.toString());

            loginMutation.mutateAsync({
                accessToken,
                refreshToken,
                userId,
                role,
                verify,
            });
            toast.success('Đăng nhập thành công');
            window.location.href = '/';
        } else {
            router.push('/');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                    <Loader2 className="h-12 w-12 text-sky-400 animate-spin" />
                </div>
                <h1 className="text-xl font-semibold text-gray-800 mb-2">
                    Đang đăng nhập...
                </h1>
                <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
        </div>
    );
}
