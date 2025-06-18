'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useResendVerifyForgotPasswordMutation } from '@/queries/useAuth';

export default function ForgotPasswordSuccessPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const resendMutation = useResendVerifyForgotPasswordMutation();
    const [isResending, setIsResending] = useState(false);

    const handleResendEmail = async () => {
        if (!email) {
            toast.error('Không tìm thấy email để gửi lại.');
            return;
        }
        try {
            setIsResending(true);
            await resendMutation.mutateAsync({ email });
            toast.success('Email đặt lại mật được gửi.');
        } catch (error) {
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold mb-4">Email đã được gửi!</h1>
            <p className="text-gray-600 mb-6">
                Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu. Nếu không
                thấy email, hãy kiểm tra trong mục thư rác.
            </p>
            {email && (
                <div className="text-sm text-gray-600 mb-4">
                    Địa chỉ email: <span className="font-medium">{email}</span>
                </div>
            )}
            <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
            >
                {isResending ? 'Đang gửi lại...' : 'Gửi lại email'}
            </Button>
        </div>
    );
}
