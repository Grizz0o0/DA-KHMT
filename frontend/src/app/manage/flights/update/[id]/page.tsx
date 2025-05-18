'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FormSelectField } from '@/components/form/FormSelectField';
import { DateTimePickerField } from '@/components/form/DateTimePickerField';

import {
    CreateFlightReqSchema as UpdateFlightSchema,
    CreateFlightReqType as UpdateFlightType,
} from '@/schemaValidations/flights.schema';
import { useFlightDetail, useUpdateFlightMutation } from '@/queries/useFlight';
import { useAirlines } from '@/queries/useAirline';
import { useAirports } from '@/queries/useAirport';
import { useAircraftByAirlineId } from '@/queries/useAircraft';

export default function UpdateFlightForm() {
    const { id } = useParams();
    const router = useRouter();

    const hasInitializedRef = useRef(false);

    const form = useForm<UpdateFlightType>({
        resolver: zodResolver(UpdateFlightSchema),
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
    const { data: flightDetail, isLoading } = useFlightDetail(id as string);
    const { data: airlines } = useAirlines();
    const { data: airports } = useAirports();

    const selectedAirlineId = form.watch('airlineId');
    const defaultAirlineId = flightDetail?.payload?.metadata?.flight.airlineId;
    const airlineIdForAircraft = selectedAirlineId || defaultAirlineId;

    const { data: aircrafts } = useAircraftByAirlineId(airlineIdForAircraft, {
        page: 1,
        limit: 100,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const airlineOptions = airlines?.payload?.metadata?.airlines || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const airportOptions = airports?.payload?.metadata?.airports || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const aircraftOptions = aircrafts?.payload.metadata.aircrafts || [];

    useEffect(() => {
        if (hasInitializedRef.current) return;

        const flight = flightDetail?.payload?.metadata?.flight;

        const ready =
            !!flight &&
            airlines?.payload?.metadata?.airlines?.length &&
            airports?.payload?.metadata?.airports?.length &&
            aircrafts?.payload?.metadata?.aircrafts?.length;

        const isNotYetInitialized =
            form.getValues('flightNumber') === '' && !form.formState.isDirty;

        if (ready && isNotYetInitialized) {
            hasInitializedRef.current = true;

            const resetData: UpdateFlightType = {
                ...flight,
                airlineId: String(flight.airlineId),
                aircraftId: String(flight.aircraftId),
                departureAirportId: String(flight.departureAirportId),
                arrivalAirportId: String(flight.arrivalAirportId),
                departureTime: new Date(flight.departureTime),
                arrivalTime: new Date(flight.arrivalTime),
                duration: flight.duration,
                price: flight.price,
                availableSeats: flight.availableSeats,
            };

            form.reset(resetData);
        }
    }, [flightDetail, airlines, airports, aircrafts, form]);

    // Reset aircraftId khi đổi airlineId
    useEffect(() => {
        if (!form.formState.isDirty) return;
        // Nếu người dùng chọn sang hãng khác thì reset loại máy bay
        form.setValue('aircraftId', '');
    }, [airlineId]);

    // Tự động tính duration
    useEffect(() => {
        const subscription = form.watch((values) => {
            const { departureTime, arrivalTime, duration } = values;
            if (!departureTime || !arrivalTime) return;

            const dep = new Date(departureTime);
            const arr = new Date(arrivalTime);

            if (!isNaN(dep.getTime()) && !isNaN(arr.getTime())) {
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

    const updateMutation = useUpdateFlightMutation();
    const onSubmit = async (values: UpdateFlightType) => {
        try {
            await updateMutation.mutateAsync({
                flightId: id as string,
                body: values,
            });
            toast.success('Cập nhật thành công');
            router.push('/manage/flights');
        } catch {
            toast.error('Cập nhật thất bại');
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">Đang tải dữ liệu...</div>;
    }

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
                        ✈️ Cập nhật chuyến bay
                    </CardTitle>
                    {/* chiếm chỗ để giữ căn giữa tiêu đề */}
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
                                name="flightNumber"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Số hiệu chuyến bay
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormSelectField
                                name="airlineId"
                                label="Hãng hàng không"
                                placeholder="Chọn hãng"
                                control={form.control}
                                options={airlineOptions.map((a) => ({
                                    label: `${a.name} (${a.code})`,
                                    value: a._id,
                                }))}
                            />

                            <FormSelectField
                                name="aircraftId"
                                label="Loại máy bay"
                                placeholder="Chọn máy bay"
                                control={form.control}
                                disabled={!airlineId}
                                options={aircraftOptions.map((ac) => ({
                                    label: `${ac.model} - ${ac.manufacturer}`,
                                    value: ac._id,
                                }))}
                            />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelectField
                                name="departureAirportId"
                                label="Sân bay đi"
                                placeholder="Chọn sân bay"
                                control={form.control}
                                options={airportOptions.map((ap) => ({
                                    label: `${ap.city} (${ap.code})`,
                                    value: ap._id,
                                }))}
                            />
                            <FormSelectField
                                name="arrivalAirportId"
                                label="Sân bay đến"
                                placeholder="Chọn sân bay"
                                control={form.control}
                                options={airportOptions.map((ap) => ({
                                    label: `${ap.city} (${ap.code})`,
                                    value: ap._id,
                                }))}
                            />

                            <DateTimePickerField
                                control={form.control}
                                name="departureTime"
                                label="Thời gian khởi hành"
                                minDate={new Date()}
                            />
                            <DateTimePickerField
                                control={form.control}
                                name="arrivalTime"
                                label="Thời gian đến"
                                minDate={form.watch('departureTime')}
                            />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                name="duration"
                                control={form.control}
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
                                name="price"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giá vé</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="availableSeats"
                                control={form.control}
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
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {updateMutation.isPending
                                ? 'Đang cập nhật...'
                                : 'Cập nhật chuyến bay'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
