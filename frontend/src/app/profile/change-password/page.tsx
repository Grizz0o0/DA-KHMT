'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ChangePasswordReqBody,
    ChangePasswordReqBodyType,
} from '@/schemaValidations/users.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useChangePasswordMutation } from '@/queries/useAccount';
import { handleErrorClient } from '@/lib/utils';
import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ChangePasswordPage = () => {
    const router = useRouter();
    const changePasswordMutation = useChangePasswordMutation();

    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ChangePasswordReqBodyType>({
        resolver: zodResolver(ChangePasswordReqBody),
        defaultValues: {
            password: '',
            newPassword: '',
            confirm_newPassword: '',
        },
    });

    const onSubmit = async (data: ChangePasswordReqBodyType) => {
        if (changePasswordMutation.isPending) return;

        try {
            await changePasswordMutation.mutateAsync(data);
            toast('Cập nhật mật khẩu thành công');
            form.reset();
            setTimeout(() => {
                router.push('/profile');
            }, 1000);
        } catch (error) {
            handleErrorClient({
                error,
                setError: form.setError,
            });
        }
    };

    return (
        <div className="container mx-auto max-w-md py-10">
            {/* Nút Quay lại */}
            <button
                type="button"
                className="flex items-center mb-4 text-gray-600 hover:text-gray-800 cursor-pointer"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2" size={15} />
                Quay lại
            </button>

            <h1 className="text-2xl font-semibold mb-6 text-center">
                Đổi mật khẩu
            </h1>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {/* Password hiện tại */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu hiện tại</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Nhập mật khẩu cũ"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Mật khẩu mới */}
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu mới</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showNewPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Nhập mật khẩu mới"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                            onClick={() =>
                                                setShowNewPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                        >
                                            {showNewPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Xác nhận mật khẩu */}
                    <FormField
                        control={form.control}
                        name="confirm_newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nhập lại mật khẩu mới</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Xác nhận mật khẩu mới"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        disabled={changePasswordMutation.isPending}
                    >
                        {changePasswordMutation.isPending
                            ? 'Đang xử lý...'
                            : 'Xác nhận đổi mật khẩu'}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default ChangePasswordPage;
