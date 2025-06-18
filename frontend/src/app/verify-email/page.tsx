'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useVerifyEmailRegisterMutation } from '@/queries/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const verifyEmailMutation = useVerifyEmailRegisterMutation();

    const token = searchParams.get('token') as string;
    const email = searchParams.get('email') as string;
    if (!token || !email) {
        toast.error('Không tìm thấy token xác thực.');
        router.push('/');
    }

    useEffect(() => {
        const verifyEmail = async () => {
            verifyEmailMutation.mutateAsync({
                verifyEmailToken: token,
                email,
            });
            router.push('/');
        };

        verifyEmail();
    }, [token, email, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
            <p className="text-lg font-semibold text-center">
                Đang xác thực email của bạn...
            </p>
        </div>
    );
}
