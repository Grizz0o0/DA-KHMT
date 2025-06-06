'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
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
import { AircraftClass } from '@/constants/aircrafts';

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
            fareOptions: [
                {
                    class: AircraftClass.Economy,
                    price: 0,
                    availableSeats: 0,
                    perks: [],
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'fareOptions',
    });

    const airlineId = form.watch('airlineId');

    const { data: airlines } = useAirlines();
    const { data: airports } = useAirports();
    const { data: aircrafts } = useAircraftByAirlineId(airlineId, {
        page: 1,
        limit: 100,
    });

    const createMutation = useCreateFlightMutation();

    useEffect(() => {
        form.setValue('aircraftId', '');
    }, [airlineId, form]);

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

    const onSubmit: SubmitHandler<CreateFlightReqType> = async (values) => {
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
                        className="text-sm px-2 cursor-pointer"
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
                        {/* Thông tin chuyến bay */}
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

                        {/* Thông tin sân bay */}
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

                        {/* Duration */}
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
                        </div>

                        <Separator />

                        {/* Fare Options */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">
                                    Tuỳ chọn vé (Fare Options)
                                </h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() =>
                                        append({
                                            class: AircraftClass.Economy,
                                            price: 0,
                                            availableSeats: 0,
                                            perks: [],
                                        })
                                    }
                                >
                                    + Thêm tuỳ chọn vé
                                </Button>
                            </div>
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 border p-3 rounded"
                                >
                                    <FormField
                                        name={`fareOptions.${index}.class`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hạng vé</FormLabel>
                                                <FormControl>
                                                    <select
                                                        {...field}
                                                        className="w-full border p-2 rounded"
                                                    >
                                                        {Object.values(
                                                            AircraftClass
                                                        ).map((cls) => (
                                                            <option
                                                                key={cls}
                                                                value={cls}
                                                            >
                                                                {cls}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name={`fareOptions.${index}.price`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Giá vé</FormLabel>
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
                                        name={`fareOptions.${index}.availableSeats`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số ghế</FormLabel>
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
                                        name={`fareOptions.${index}.perks`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-4">
                                                <FormLabel>
                                                    Ưu đãi (Perks)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="Nhập perks cách nhau bởi dấu phẩy"
                                                        value={
                                                            field.value?.join(
                                                                ', '
                                                            ) || ''
                                                        }
                                                        onChange={(e) => {
                                                            const perksArray =
                                                                e.target.value
                                                                    .split(',')
                                                                    .map(
                                                                        (
                                                                            perk
                                                                        ) =>
                                                                            perk.trim()
                                                                    )
                                                                    .filter(
                                                                        Boolean
                                                                    );
                                                            field.onChange(
                                                                perksArray
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => remove(index)}
                                        >
                                            Xoá
                                        </Button>
                                    </div>
                                </div>
                            ))}
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
