// File: src/app/manage/promocodes/create/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import {
    CreatePromoCodeReqSchema,
    CreatePromoCodeReqType,
} from '@/schemaValidations/promoCodes.schema';
import { useCreatePromoCodeMutation } from '@/queries/usePromoCode';

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

export default function CreatePromoCodePage() {
    const router = useRouter();

    const form = useForm<CreatePromoCodeReqType>({
        resolver: zodResolver(CreatePromoCodeReqSchema),
        defaultValues: {
            code: '',
            discountPercentage: undefined,
            discountAmount: undefined,
            startDate: undefined,
            endDate: undefined,
            maxUsage: undefined,
            usedCount: undefined,
        },
    });

    const mutation = useCreatePromoCodeMutation();

    const onSubmit = async (values: CreatePromoCodeReqType) => {
        try {
            await mutation.mutateAsync(values);
            toast.success('Thêm mã giảm giá thành công');
            router.replace('/manage/promocodes');
        } catch {
            toast.error('Thêm thất bại');
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-4">
                <Button
                    className="cursor-pointer"
                    variant="ghost"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
                </Button>
                <h1 className="text-2xl font-bold">Thêm mã giảm giá</h1>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        name="code"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã giảm giá</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="discountPercentage"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phần trăm giảm (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={field.value ?? ''}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="discountAmount"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giảm giá cố định (VNĐ)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={field.value ?? ''}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="startDate"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày bắt đầu</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={
                                            field.value
                                                ? field.value
                                                      .toISOString()
                                                      .split('T')[0]
                                                : ''
                                        }
                                        onChange={(e) =>
                                            field.onChange(
                                                new Date(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="endDate"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày kết thúc</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={
                                            field.value
                                                ? field.value
                                                      .toISOString()
                                                      .split('T')[0]
                                                : ''
                                        }
                                        onChange={(e) =>
                                            field.onChange(
                                                new Date(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="maxUsage"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Số lượt dùng tối đa (bỏ trống nếu không giới
                                    hạn)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={field.value ?? ''}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full"
                    >
                        {mutation.isPending && (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        )}
                        Thêm mã
                    </Button>
                </form>
            </Form>
        </div>
    );
}
