'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronsUpDown, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAirports } from '@/queries/useAirport';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AircraftClass } from '@/constants/aircrafts';
import { FormSelectField } from '@/components/form/FormSelectField';

const passengerSchema = z.object({
    adults: z.number().min(1),
    children: z.number().min(0),
    infants: z.number().min(0),
});

const formSchema = z
    .object({
        type: z.enum(['khu-hoi', 'mot-chieu']),
        from: z.string().min(1, 'Vui lòng chọn điểm đi'),
        to: z.string().min(1, 'Vui lòng chọn điểm đến'),
        departureDate: z.date({ required_error: 'Vui lòng chọn ngày đi' }),
        returnDate: z.date().optional(),
        passengers: passengerSchema,
        seatClass: z.nativeEnum(AircraftClass),
    })
    .refine((data) => data.from !== data.to, {
        message: 'Điểm đi và điểm đến không được trùng nhau',
        path: ['to'],
    });

type FormData = z.infer<typeof formSchema>;

export default function SearchFlightsForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassengerModal, setShowPassengerModal] = useState(false);

    const {
        data: airportData,
        isLoading: isAirportLoading,
        isError,
    } = useAirports({ page: 1, limit: 100 });
    const airports = useMemo(
        () => airportData?.payload?.metadata?.airports || [],
        [airportData]
    );

    const methods = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type:
                (searchParams.get('type') as 'khu-hoi' | 'mot-chieu') ??
                'mot-chieu',
            from: '',
            to: '',
            departureDate: undefined,
            returnDate: undefined,
            passengers: {
                adults: Number(searchParams.get('adults') || '1'),
                children: Number(searchParams.get('children') || '0'),
                infants: Number(searchParams.get('infants') || '0'),
            },
            seatClass:
                (searchParams.get('class') as AircraftClass) ??
                AircraftClass.Economy,
        },
    });

    const {
        setValue,
        handleSubmit,
        watch,
        control,
        register,
        formState: { errors },
    } = methods;

    const type = watch('type');
    const departureDate = watch('departureDate');
    const returnDate = watch('returnDate');
    const passengers = watch('passengers');

    useEffect(() => {
        if (!airports.length) return;
        const fromCode = searchParams.get('departureAirportCode');
        const toCode = searchParams.get('arrivalAirportCode');
        const dTime = searchParams.get('departureTime');
        const rTime = searchParams.get('returnTime');
        const type = searchParams.get('type') as 'khu-hoi' | 'mot-chieu';
        const cls = searchParams.get('class') as AircraftClass;

        if (fromCode && airports.find((a) => a.code === fromCode))
            setValue('from', fromCode);
        if (toCode && airports.find((a) => a.code === toCode))
            setValue('to', toCode);
        if (dTime) setValue('departureDate', new Date(dTime));
        if (rTime) setValue('returnDate', new Date(rTime));
        if (type) setValue('type', type);
        if (cls) setValue('seatClass', cls);
    }, [airports, searchParams, setValue]);

    useEffect(() => {
        if (isError) toast.error('Không thể tải danh sách sân bay');
    }, [isError]);

    const onSubmit = (data: FormData) => {
        const query = new URLSearchParams();

        query.set('departureAirportCode', data.from);
        query.set('arrivalAirportCode', data.to);
        query.set('departureTime', format(data.departureDate, 'yyyy-MM-dd'));

        if (data.type === 'khu-hoi' && data.returnDate) {
            query.set('returnTime', format(data.returnDate, 'yyyy-MM-dd'));
        }

        query.set('adults', String(data.passengers.adults));
        query.set('children', String(data.passengers.children));
        query.set('infants', String(data.passengers.infants));
        query.set(
            'passengerCount',
            (
                data.passengers.adults +
                data.passengers.children +
                data.passengers.infants
            ).toString()
        );
        query.set('class', data.seatClass);
        query.set('type', data.type);
        query.set('page', '1');
        query.set('limit', '10');

        router.push(`/flights?${query.toString()}`);
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-7xl mx-auto rounded-xl shadow-lg border bg-white px-6 py-6 space-y-4"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Tabs
                        value={type}
                        onValueChange={(val) => setValue('type', val as any)}
                    >
                        <TabsList className="rounded-full border bg-gray-100">
                            <TabsTrigger
                                value="mot-chieu"
                                className="cursor-pointer"
                            >
                                Một chiều
                            </TabsTrigger>
                            <TabsTrigger
                                value="khu-hoi"
                                className="cursor-pointer"
                            >
                                Khứ hồi
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-3">
                        <Popover
                            open={showPassengerModal}
                            onOpenChange={setShowPassengerModal}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="rounded-full px-4 py-2"
                                >
                                    <Users size={16} />
                                    <span className="text-sm cursor-pointer">
                                        {passengers.adults} Người lớn,{' '}
                                        {passengers.children} Trẻ em,{' '}
                                        {passengers.infants} Em bé
                                    </span>
                                    <ChevronsUpDown className="w-4 h-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[320px] space-y-3 rounded-xl shadow-xl">
                                {(
                                    ['adults', 'children', 'infants'] as const
                                ).map((key) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {key === 'adults'
                                                    ? 'Người lớn'
                                                    : key === 'children'
                                                    ? 'Trẻ em'
                                                    : 'Em bé'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {key === 'adults'
                                                    ? 'Từ 12 tuổi'
                                                    : key === 'children'
                                                    ? 'Từ 2 - 11 tuổi'
                                                    : 'Dưới 2 tuổi'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    setValue(
                                                        `passengers.${key}`,
                                                        Math.max(
                                                            0,
                                                            passengers[key] - 1
                                                        )
                                                    )
                                                }
                                            >
                                                -
                                            </Button>
                                            <span className="w-6 text-center">
                                                {passengers[key]}
                                            </span>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    setValue(
                                                        `passengers.${key}`,
                                                        Math.min(
                                                            9,
                                                            passengers[key] + 1
                                                        )
                                                    )
                                                }
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    className="w-full mt-2 bg-blue-500 text-white"
                                    onClick={() => setShowPassengerModal(false)}
                                >
                                    Xong
                                </Button>
                            </PopoverContent>
                        </Popover>

                        <FormSelectField
                            name="seatClass"
                            label=""
                            placeholder="Chọn hạng ghế"
                            control={control}
                            options={[
                                {
                                    value: AircraftClass.Economy,
                                    label: 'Phổ thông',
                                },
                                {
                                    value: AircraftClass.Business,
                                    label: 'Thương gia',
                                },
                                {
                                    value: AircraftClass.FirstClass,
                                    label: 'Hạng nhất',
                                },
                            ]}
                        />
                    </div>
                </div>

                {/* Input fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="text-sm">Từ</label>
                        <select
                            {...register('from')}
                            className="w-full border rounded px-3 py-2 mt-1 text-sm cursor-pointer"
                        >
                            <option value="">Chọn điểm đi</option>
                            {airports.map((a) => (
                                <option key={a.code} value={a.code}>
                                    {a.city} ({a.code})
                                </option>
                            ))}
                        </select>
                        {errors.from && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.from.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm">Đến</label>
                        <select
                            {...register('to')}
                            className="w-full border rounded px-3 py-2 mt-1 text-sm cursor-pointer"
                        >
                            <option value="">Chọn điểm đến</option>
                            {airports.map((a) => (
                                <option key={a.code} value={a.code}>
                                    {a.city} ({a.code})
                                </option>
                            ))}
                        </select>
                        {errors.to && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.to.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm">Ngày đi</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start mt-1 text-sm cursor-pointer"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {departureDate
                                        ? format(departureDate, 'dd/MM/yyyy')
                                        : 'Chọn ngày'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={departureDate}
                                    onSelect={(date) =>
                                        setValue('departureDate', date!)
                                    }
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.departureDate && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.departureDate.message}
                            </p>
                        )}
                    </div>
                    <div
                        className={
                            type === 'mot-chieu'
                                ? 'opacity-50 pointer-events-none'
                                : ''
                        }
                    >
                        <label className="text-sm">Ngày về</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start mt-1 text-sm cursor-pointer"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {returnDate
                                        ? format(returnDate, 'dd/MM/yyyy')
                                        : 'Chọn ngày'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={returnDate}
                                    onSelect={(date) =>
                                        setValue('returnDate', date!)
                                    }
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex items-end">
                        <Button
                            type="submit"
                            disabled={isAirportLoading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                        >
                            {isAirportLoading
                                ? 'Đang tìm...'
                                : 'Tìm chuyến bay'}
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
