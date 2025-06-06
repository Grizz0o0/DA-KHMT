'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import {
    CreateAirportReqSchema,
    CreateAirportReqType,
} from '@/schemaValidations/airports.schema';
import {
    useAirportDetail,
    useUpdateAirportMutation,
} from '@/queries/useAirport';

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

export default function UpdateAirportPage() {
    const { id } = useParams();
    const router = useRouter();

    const form = useForm<CreateAirportReqType>({
        resolver: zodResolver(CreateAirportReqSchema),
        defaultValues: {
            name: '',
            code: '',
            city: '',
            country: '',
        },
    });

    const { data, isLoading } = useAirportDetail(id as string);
    const mutation = useUpdateAirportMutation();

    useEffect(() => {
        const airport = data?.payload?.metadata?.airport;
        if (airport) {
            form.reset({
                name: airport.name,
                code: airport.code,
                city: airport.city,
                country: airport.country,
            });
        }
    }, [data, form]);

    const onSubmit = async (values: CreateAirportReqType) => {
        try {
            await mutation.mutateAsync({
                airportId: id as string,
                body: values,
            });
            toast.success('Cập nhật sân bay thành công');
            router.push('/manage/airports');
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
                <h1 className="text-2xl font-bold">Cập nhật sân bay</h1>
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
                                <FormLabel>Tên sân bay</FormLabel>
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
                                <FormLabel>Mã sân bay (IN HOA)</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="city"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Thành phố</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="country"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quốc gia</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                        Cập nhật sân bay
                    </Button>
                </form>
            </Form>
        </div>
    );
}
