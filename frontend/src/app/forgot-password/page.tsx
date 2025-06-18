'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useForgotPasswordMutation } from '@/queries/useAuth'; // Custom hook của bạn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const ForgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const forgotPasswordMutation = useForgotPasswordMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(ForgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await forgotPasswordMutation.mutateAsync(data);
            reset();
            router.push(
                `/forgot-password/success?email=${encodeURIComponent(
                    data.email
                )}`
            );
        } catch (error: any) {
            toast.error(
                error?.message ||
                    'Đã xảy ra lỗi khi gửi email. Vui lòng thử lại!'
            );
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center mb-4">
                Quên mật khẩu
            </h1>
            <p className="text-center text-gray-600 mb-6">
                Vui lòng nhập email đã đăng ký để nhận link đặt lại mật khẩu.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium"
                    >
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        {...register('email')}
                        className="mt-1"
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? 'Đang gửi...'
                        : 'Gửi email đặt lại mật khẩu'}
                </Button>
            </form>
        </div>
    );
}
