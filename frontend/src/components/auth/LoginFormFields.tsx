'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    LoginSchemaBody,
    LoginReqBodyType,
} from '@/schemaValidations/users.schema';
import { toast } from 'sonner';
import { useLoginMutation } from '@/queries/useAuth';
import { handleErrorClient } from '@/lib/utils';

type Props = {
    setOpen: (open: boolean) => void;
};

export default function LoginFormFields({ setOpen }: Props) {
    const loginMutation = useLoginMutation();
    const form = useForm<LoginReqBodyType>({
        resolver: zodResolver(LoginSchemaBody),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginReqBodyType) => {
        if (loginMutation.isPending) return;
        try {
            const result = await loginMutation.mutateAsync(data);
            toast.message(result.payload.message);
            setOpen(false);
        } catch (error) {
            handleErrorClient({ error, setError: form.setError });
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, (err) =>
                    console.warn(err)
                )}
                className="space-y-4"
                noValidate
            >
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
                <Button className="w-full mt-2 cursor-pointer" type="submit">
                    Đăng nhập
                </Button>
            </form>
        </Form>
    );
}
