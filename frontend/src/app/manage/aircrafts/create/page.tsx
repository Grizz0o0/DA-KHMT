'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

import {
    CreateAircraftReqSchema,
    CreateAircraftReqType,
} from '@/schemaValidations/aircrafts.schema';
import { useCreateAircraftMutation } from '@/queries/useAircraft';
import { FormSelectField } from '@/components/form/FormSelectField';
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
import { useAirlines } from '@/queries/useAirline';

export default function CreateAircraftPage() {
    const router = useRouter();
    const form = useForm<CreateAircraftReqType>({
        resolver: zodResolver(CreateAircraftReqSchema),
        defaultValues: {
            model: '',
            manufacturer: '',
            airlineId: '',
            aircraftCode: '',
            seatConfiguration: {
                economy: { rows: 0, seatsPerRow: 0 },
                business: { rows: 0, seatsPerRow: 0 },
                firstClass: { rows: 0, seatsPerRow: 0 },
            },
        },
    });

    const mutation = useCreateAircraftMutation();
    const { data: airlines } = useAirlines();

    const onSubmit = async (values: CreateAircraftReqType) => {
        try {
            await mutation.mutateAsync(values);
            toast.success('Thêm máy bay thành công');
            router.push('/manage/aircrafts');
        } catch {
            toast.error('Thêm máy bay thất bại');
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
                <h1 className="text-2xl font-bold">Thêm máy bay</h1>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        name="model"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="manufacturer"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hãng sản xuất</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="airlineId"
                        control={form.control}
                        render={() => (
                            <FormSelectField
                                name="airlineId"
                                label="Hãng hàng không"
                                placeholder="Chọn hãng"
                                control={form.control}
                                options={
                                    airlines?.payload?.metadata?.airlines?.map(
                                        (a) => ({
                                            label: `${a.name} (${a.code})`,
                                            value: a._id,
                                        })
                                    ) ?? []
                                }
                            />
                        )}
                    />
                    <FormField
                        name="aircraftCode"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã máy bay</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {(['economy', 'business', 'firstClass'] as const).map(
                        (cls) => (
                            <div key={cls} className="grid grid-cols-2 gap-4">
                                <FormField
                                    name={`seatConfiguration.${cls}.rows`}
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{`Số hàng ghế (${cls})`}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name={`seatConfiguration.${cls}.seatsPerRow`}
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{`Ghế mỗi hàng (${cls})`}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )
                    )}

                    <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full cursor-pointer"
                    >
                        {mutation.isPending && (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        )}
                        Thêm máy bay
                    </Button>
                </form>
            </Form>
        </div>
    );
}
