'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

import {
    CreateAirportReqSchema,
    CreateAirportReqType,
} from '@/schemaValidations/airports.schema';
import { useCreateAirportMutation } from '@/queries/useAirport';

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

export default function CreateAirportPage() {
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

    const mutation = useCreateAirportMutation();

    const onSubmit = async (values: CreateAirportReqType) => {
        try {
            await mutation.mutateAsync(values);
            toast.success('Thêm sân bay thành công');
            router.push('/manage/airports');
        } catch {
            toast.error('Thêm sân bay thất bại');
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
                <h1 className="text-2xl font-bold">Thêm sân bay</h1>
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
                                    <Input
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                    />
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
                        Thêm sân bay
                    </Button>
                </form>
            </Form>
        </div>
    );
}
