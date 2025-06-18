'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';

import { useAccountMe, useUpdateMeMutation } from '@/queries/useAccount';
import {
    UpdateMeReqBodyType,
    UpdateMeReqBody,
} from '@/schemaValidations/users.schema';
import { UserGender } from '@/constants/users';
import { useUploadMediaMutation } from '@/queries/userMedia';
import { handleErrorClient } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

export default function UpdateProfilePage() {
    const router = useRouter();
    const { data } = useAccountMe();
    const queryClient = useQueryClient();
    const updateMeMutation = useUpdateMeMutation();
    const uploadMediaMutation = useUploadMediaMutation();
    const user = data?.payload?.metadata?.user;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<UpdateMeReqBodyType>({
        resolver: zodResolver(UpdateMeReqBody),
        defaultValues: {
            username: '',
            email: '',
            phoneNumber: '',
            dateOfBirth: '',
            gender: UserGender.Other,
            address: '',
            avatar: '',
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                username: user.username || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                gender: (user.gender as UserGender) || UserGender.Other,
                address: user.address || '',
                avatar: user.avatar || '',
                dateOfBirth: user.dateOfBirth
                    ? new Date(user.dateOfBirth).toISOString().split('T')[0]
                    : '',
            });
            setPreviewUrl(user.avatar || null);
        }
    }, [user, form]);

    const onSubmit = async (values: UpdateMeReqBodyType) => {
        if (updateMeMutation.isPending) return;

        try {
            let avatarUrl = values.avatar;

            if (selectedFile) {
                try {
                    const formData = new FormData();
                    formData.append('image', selectedFile);
                    const uploadImageResult =
                        await uploadMediaMutation.mutateAsync(formData);
                    console.log('✅ Upload thành công:', uploadImageResult);
                    avatarUrl =
                        uploadImageResult.payload.metadata.image.files[0].url;
                } catch (error) {
                    console.error('❌ Upload thất bại:', error);
                }
            }

            const body: UpdateMeReqBodyType = {
                ...values,
                avatar: avatarUrl,
            };

            await updateMeMutation.mutateAsync(body);

            await queryClient.invalidateQueries({ queryKey: ['account-me'] });
            toast('Cập nhật hồ sơ thành công');
            router.push('/profile');
        } catch (error) {
            handleErrorClient({
                error,
                setError: form.setError,
            });
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10 px-4">
            {/* Nút Quay lại */}
            <div className="relative flex items-center justify-center mb-6">
                <Button
                    variant="ghost"
                    type="button"
                    className="absolute left-0 flex items-center text-gray-600 hover:text-gray-800 cursor-pointer"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={15} />
                    Quay lại
                </Button>
                <h1 className="text-2xl font-semibold mb-6 text-center">
                    Cập nhật hồ sơ
                </h1>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên người dùng</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Tên người dùng"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Email" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số điện thoại</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Số điện thoại"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày sinh</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={field.value?.toString() || ''}
                                        className="cursor-pointer"
                                        onChange={(e) =>
                                            field.onChange(e.target.value)
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giới tính</FormLabel>
                                <FormControl className="cursor-pointer">
                                    <select
                                        {...field}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Địa chỉ</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Địa chỉ cư trú"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="avatar"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ảnh đại diện</FormLabel>
                                <FormControl>
                                    <div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="cursor-pointer"
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    setPreviewUrl(
                                                        URL.createObjectURL(
                                                            file
                                                        )
                                                    );
                                                } else {
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                }
                                            }}
                                        />
                                        {(previewUrl || field.value) && (
                                            <div className="w-50 h-50 rounded-full overflow-hidden mt-2 relative">
                                                <Image
                                                    src={
                                                        previewUrl! ||
                                                        field.value!
                                                    }
                                                    alt="Avatar Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full mt-4 cursor-pointer"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting
                            ? 'Đang lưu...'
                            : 'Lưu thay đổi'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
