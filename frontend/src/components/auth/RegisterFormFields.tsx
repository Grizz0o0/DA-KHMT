'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    RegisterSchemaBody,
    RegisterReqBodyType,
} from '@/schemaValidations/users.schema';
import { useRegisterMutation } from '@/queries/useAuth';
import { handleErrorClient } from '@/lib/utils';
import { toast } from 'sonner';

type Props = {
    setOpen: (open: boolean) => void;
};

export default function RegisterFormFields({ setOpen }: Props) {
    const [isChecked, setIsChecked] = useState(false);
    const registerMutation = useRegisterMutation();
    const form = useForm<RegisterReqBodyType>({
        resolver: zodResolver(RegisterSchemaBody),
        defaultValues: {
            username: '',
            phoneNumber: '',
            email: '',
            password: '',
            confirm_password: '',
        },
    });

    const onSubmit = async (values: RegisterReqBodyType) => {
        if (registerMutation.isPending) return;
        try {
            await registerMutation.mutateAsync(values);
            toast.success(
                `Đăng ký thành công. Vui lòng xác thực email để đăng nhập.`
            );
            setOpen(false);
        } catch (error) {
            handleErrorClient({ error, setError: form.setError });
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
            >
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Họ & Tên</Label>
                            <Input
                                type="text"
                                placeholder="Nhập họ và tên"
                                {...field}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Số điện thoại</Label>
                            <Input
                                type="tel"
                                placeholder="Nhập số điện thoại"
                                {...field}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="Nhập email"
                                {...field}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Mật khẩu</Label>
                            <Input
                                type="password"
                                placeholder="Nhập mật khẩu"
                                {...field}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Xác nhận mật khẩu</Label>
                            <Input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                {...field}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="terms"
                        className="mr-2 cursor-pointer"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                    />
                    <label htmlFor="terms" className="text-sm cursor-pointer">
                        Tôi đồng ý với{' '}
                        <span className="text-blue-500 cursor-pointer">
                            Điều khoản và điều kiện
                        </span>
                    </label>
                </div>

                <Button
                    className="w-full mt-2 cursor-pointer"
                    type="submit"
                    disabled={!isChecked}
                >
                    Đăng ký
                </Button>
            </form>
        </Form>
    );
}
