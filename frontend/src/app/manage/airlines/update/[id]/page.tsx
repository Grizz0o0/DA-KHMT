'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    CreateAirlineReqSchema,
    CreateAirlineReqType,
} from '@/schemaValidations/airlines.schema';
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
import { Textarea } from '@/components/ui/textarea';
import {
    useAirlineDetail,
    useUpdateAirlineMutation,
} from '@/queries/useAirline';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUploadMediaMutation } from '@/queries/userMedia';
import Image from 'next/image';

export default function UpdateAirlinePage() {
    const { id } = useParams();
    const router = useRouter();
    const uploadMediaMutation = useUploadMediaMutation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const form = useForm<CreateAirlineReqType>({
        resolver: zodResolver(CreateAirlineReqSchema),
        defaultValues: {
            name: '',
            code: '',
            logo: '',
            description: '',
        },
    });

    const { data } = useAirlineDetail(id as string);
    const mutation = useUpdateAirlineMutation();

    useEffect(() => {
        const airline = data?.payload?.metadata?.airline;
        if (airline) {
            form.reset({
                name: airline.name,
                code: airline.code,
                logo: airline.logo || '',
                description: airline.description || '',
            });
            setPreviewUrl(airline.logo || null);
        }
    }, [data, form]);

    const queryClient = useQueryClient();

    const onSubmit = async (values: CreateAirlineReqType) => {
        try {
            let logoUrl = values.logo;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('image', selectedFile);

                const uploadResult = await uploadMediaMutation.mutateAsync(
                    formData
                );
                logoUrl = uploadResult.payload.metadata.image.files[0].url;
            }

            await mutation.mutateAsync({
                airlineId: id as string,
                body: {
                    ...values,
                    logo: logoUrl,
                },
            });

            queryClient.invalidateQueries({ queryKey: ['airlines'] });

            toast.success('Cập nhật thành công');
            router.push('/manage/airlines');
        } catch {
            toast.error('Cập nhật thất bại');
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
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại
                </Button>
                <h1 className="text-2xl font-bold">Cập nhật hãng hàng không</h1>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên hãng</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="code"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã hãng (2 chữ IN HOA)</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="logo"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Logo hãng</FormLabel>
                                <FormControl>
                                    <div>
                                        <Input
                                            type="file"
                                            accept="image/*"
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
                                        {(previewUrl || field.value) &&
                                            (() => {
                                                const logoSrc =
                                                    previewUrl ?? field.value;
                                                if (
                                                    typeof logoSrc ===
                                                        'string' &&
                                                    (logoSrc.startsWith(
                                                        'http'
                                                    ) ||
                                                        logoSrc.startsWith('/'))
                                                ) {
                                                    return (
                                                        <div className="w-36 h-36 relative mt-2 border rounded overflow-hidden">
                                                            <Image
                                                                src={logoSrc}
                                                                alt="Logo preview"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })()}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Nhập mô tả hãng hàng không..."
                                        className="min-h-[100px] resize-y"
                                        {...field}
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
                        Cập nhật hãng
                    </Button>
                </form>
            </Form>
        </div>
    );
}
