'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { FormSelectField } from '@/components/form/FormSelectField';
import { DateTimePickerField } from '@/components/form/DateTimePickerField';

import {
    CreateFlightReqSchema,
    CreateFlightReqType,
} from '@/schemaValidations/flights.schema';
import { useAirlines } from '@/queries/useAirline';
import { useAirports } from '@/queries/useAirport';
import { useAircraftByAirlineId } from '@/queries/useAircraft';
import { useCreateFlightMutation } from '@/queries/useFlight';

export default function CreateFlightForm() {
    const router = useRouter();
    const form = useForm<CreateFlightReqType>({
        resolver: zodResolver(CreateFlightReqSchema),
        defaultValues: {
            flightNumber: '',
            airlineId: '',
            aircraftId: '',
            departureAirportId: '',
            arrivalAirportId: '',
            departureTime: undefined,
            arrivalTime: undefined,
            duration: 0,
            price: 0,
            availableSeats: 0,
        },
    });

    const airlineId = form.watch('airlineId');

    const { data: airlines } = useAirlines();
    const { data: airports } = useAirports();
    const { data: aircrafts } = useAircraftByAirlineId(airlineId, {
        page: 1,
        limit: 100,
    });

    const createMutation = useCreateFlightMutation();

    // Reset aircraftId khi đổi airlineId
    useEffect(() => {
        form.setValue('aircraftId', '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [airlineId]);

    // Tự động tính duration
    useEffect(() => {
        const subscription = form.watch((values) => {
            const { departureTime, arrivalTime, duration } = values;

            if (!departureTime || !arrivalTime) return;

            const dep = new Date(departureTime);
            const arr = new Date(arrivalTime);

            if (
                dep instanceof Date &&
                arr instanceof Date &&
                !isNaN(dep.getTime()) &&
                !isNaN(arr.getTime())
            ) {
                const newDuration = differenceInMinutes(arr, dep);
                if (newDuration > 0 && newDuration !== duration) {
                    form.setValue('duration', newDuration, {
                        shouldDirty: true,
                        shouldValidate: false,
                    });
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);

    const onSubmit = async (values: CreateFlightReqType) => {
        try {
            await createMutation.mutateAsync(values);
            toast.success('Tạo chuyến bay thành công');
            form.reset();
        } catch {
            toast.error('Đã có lỗi xảy ra khi tạo chuyến bay');
        }
    };

    return (
        <Card className="max-w-4xl mx-auto mt-8">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-sm px-2"
                    >
                        ← Quay lại
                    </Button>
                    <CardTitle className="text-xl font-semibold text-center w-full">
                        ✈️ Tạo chuyến bay mới
                    </CardTitle>
                    <div className="w-[80px]" />
                </div>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="flightNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Số hiệu chuyến bay
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="VD: VN123"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormSelectField
                                name="airlineId"
                                label="Hãng hàng không"
                                placeholder="Chọn hãng"
                                options={
                                    airlines?.payload.metadata.airlines?.map(
                                        (a) => ({
                                            label: `${a.name} (${a.code})`,
                                            value: a._id,
                                        })
                                    ) || []
                                }
                                control={form.control}
                            />

                            <FormSelectField
                                name="aircraftId"
                                label="Loại máy bay"
                                placeholder={
                                    airlineId
                                        ? 'Chọn máy bay'
                                        : 'Chọn hãng trước'
                                }
                                options={
                                    aircrafts?.payload?.metadata?.aircrafts?.map(
                                        (ac) => ({
                                            label: `${ac.model} - ${ac.manufacturer}`,
                                            value: ac._id,
                                        })
                                    ) || []
                                }
                                control={form.control}
                                disabled={!airlineId}
                            />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelectField
                                name="departureAirportId"
                                label="Sân bay đi"
                                placeholder="Chọn sân bay khởi hành"
                                options={
                                    airports?.payload.metadata.airports?.map(
                                        (ap) => ({
                                            label: `${ap.city} (${ap.code})`,
                                            value: ap._id,
                                        })
                                    ) || []
                                }
                                control={form.control}
                            />
                            <FormSelectField
                                name="arrivalAirportId"
                                label="Sân bay đến"
                                placeholder="Chọn sân bay đến"
                                options={
                                    airports?.payload.metadata.airports?.map(
                                        (ap) => ({
                                            label: `${ap.city} (${ap.code})`,
                                            value: ap._id,
                                        })
                                    ) || []
                                }
                                control={form.control}
                            />

                            <DateTimePickerField
                                control={form.control}
                                name="departureTime"
                                label="Thời gian khởi hành"
                            />
                            <DateTimePickerField
                                control={form.control}
                                name="arrivalTime"
                                label="Thời gian đến"
                            />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Thời gian bay (phút)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                readOnly
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giá vé (VND)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="availableSeats"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số ghế</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending
                                ? 'Đang tạo...'
                                : 'Tạo chuyến bay'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
