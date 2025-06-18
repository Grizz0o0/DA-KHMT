'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ResetPasswordSchemaBody,
    ResetPasswordReqBodyType,
} from '@/schemaValidations/users.schema';
import { toast } from 'sonner';
import { useResetPasswordMutation } from '@/queries/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const forgotPasswordToken = searchParams.get('token');

    const resetPasswordMutation = useResetPasswordMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm<ResetPasswordReqBodyType>({
        resolver: zodResolver(ResetPasswordSchemaBody),
    });

    // Set token from URL to form (one-time)
    if (forgotPasswordToken) {
        setValue('forgotPasswordToken', forgotPasswordToken);
    }

    const onSubmit = async (data: ResetPasswordReqBodyType) => {
        try {
            await resetPasswordMutation.mutateAsync(data);
        } catch (error: any) {
            toast.error(
                error?.message ||
                    'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại!'
            );
        }
        router.push('/');
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center mb-4">
                Đặt lại mật khẩu
            </h1>
            <p className="text-center text-gray-600 mb-6">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium"
                    >
                        Mật khẩu mới
                    </label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        {...register('password')}
                        className="mt-1"
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>
                <div>
                    <label
                        htmlFor="confirm_password"
                        className="block text-sm font-medium"
                    >
                        Xác nhận mật khẩu
                    </label>
                    <Input
                        id="confirm_password"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        {...register('confirm_password')}
                        className="mt-1"
                    />
                    {errors.confirm_password && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.confirm_password.message}
                        </p>
                    )}
                </div>
                {/* Hidden token field */}
                <input
                    type="hidden"
                    {...register('forgotPasswordToken')}
                    value={forgotPasswordToken || ''}
                />
                {errors.forgotPasswordToken && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.forgotPasswordToken.message}
                    </p>
                )}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </Button>
            </form>
        </div>
    );
}
