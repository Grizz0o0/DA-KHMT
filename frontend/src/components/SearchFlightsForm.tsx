/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, ChevronsUpDown, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { fetchAirports, searchFlights } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const passengerSchema = z.object({
    adults: z.number().min(1),
    children: z.number().min(0),
    infants: z.number().min(0),
});

const formSchema = z.object({
    type: z.enum(['khu-hoi', 'mot-chieu']),
    from: z.string().min(1),
    to: z.string().min(1),
    departureDate: z.date(),
    returnDate: z.date().optional(),
    passengers: passengerSchema,
    seatClass: z.enum(['economy', 'business', 'firstClass']),
});

type FormData = z.infer<typeof formSchema>;
type Airport = { code: string; city: string; country: string };

export default function TravelokaSearchForm() {
    const router = useRouter();
    const [tripType, setTripType] = useState<'khu-hoi' | 'mot-chieu'>(
        'khu-hoi'
    );
    const [airports, setAirports] = useState<Airport[]>([]);
    const [showPassengerModal, setShowPassengerModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        // formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'khu-hoi',
            passengers: { adults: 1, children: 0, infants: 0 },
            seatClass: 'economy',
        },
    });

    const departureDate = watch('departureDate');
    const returnDate = watch('returnDate');
    const passengers = watch('passengers');
    // const seatClass = watch('seatClass');
    useEffect(() => {
        fetchAirports()
            .then((data) => setAirports(data.airports))
            .catch(() => toast.error('Không thể tải sân bay.'));
    }, []);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            await searchFlights({
                from: data.from,
                to: data.to,
                departureDate: format(data.departureDate, 'yyyy-MM-dd'),
                returnDate: data.returnDate
                    ? format(data.returnDate, 'yyyy-MM-dd')
                    : undefined,
                passengers:
                    data.passengers.adults +
                    data.passengers.children +
                    data.passengers.infants,
                seatClass: data.seatClass,
            });
            router.push('/flights');
        } catch {
            toast.error('Không thể tìm chuyến bay.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-6xl mx-auto rounded-xl shadow-lg border bg-white px-6 py-6 space-y-4"
        >
            {/* Tabs + Passenger */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Tabs
                    defaultValue="khu-hoi"
                    onValueChange={(val) => {
                        setTripType(val as any);
                        setValue('type', val as any);
                    }}
                >
                    <TabsList className="rounded-full border bg-gray-100">
                        <TabsTrigger
                            value="mot-chieu"
                            className="px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-full cursor-pointer"
                        >
                            Một chiều
                        </TabsTrigger>
                        <TabsTrigger
                            value="khu-hoi"
                            className="px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-full cursor-pointer"
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
                                className="rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer"
                            >
                                <Users size={16} />
                                <span className="text-sm">
                                    {passengers.adults} Người lớn,{' '}
                                    {passengers.children} Trẻ em,{' '}
                                    {passengers.infants} Em bé
                                </span>
                                <ChevronsUpDown className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] space-y-3 rounded-xl shadow-xl">
                            {['adults', 'children', 'infants'].map((key) => (
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
                                                    `passengers.${key}` as
                                                        | 'passengers.adults'
                                                        | 'passengers.children'
                                                        | 'passengers.infants',
                                                    Math.max(
                                                        0,
                                                        passengers[
                                                            key as keyof typeof passengers
                                                        ] - 1
                                                    )
                                                )
                                            }
                                        >
                                            -
                                        </Button>
                                        <span className="w-6 text-center">
                                            {
                                                passengers[
                                                    key as keyof typeof passengers
                                                ]
                                            }
                                        </span>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            className="cursor-pointer"
                                            onClick={() =>
                                                setValue(
                                                    `passengers.${key}` as
                                                        | 'passengers.adults'
                                                        | 'passengers.children'
                                                        | 'passengers.infants',
                                                    Math.min(
                                                        9,
                                                        passengers[
                                                            key as keyof typeof passengers
                                                        ] + 1
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
                                className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                                onClick={() => setShowPassengerModal(false)}
                            >
                                Xong
                            </Button>
                        </PopoverContent>
                    </Popover>

                    <Select {...register('seatClass')} defaultValue="economy">
                        <SelectTrigger className="w-30 cursor-pointer">
                            <SelectValue placeholder="Chọn hạng ghế" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                className="cursor-pointer"
                                value="economy"
                            >
                                Phổ thông
                            </SelectItem>
                            <SelectItem
                                className="cursor-pointer"
                                value="business"
                            >
                                Thương gia
                            </SelectItem>
                            <SelectItem
                                className="cursor-pointer"
                                value="firstClass"
                            >
                                Hạng nhất
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Form fields */}
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
                                className="w-full rounded-md border bg-white shadow-md"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div
                    className={
                        tripType === 'mot-chieu'
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
                                locale={vi}
                                selected={returnDate}
                                onSelect={(date) =>
                                    setValue('returnDate', date!)
                                }
                                mode="single"
                                disabled={(d) =>
                                    d < (departureDate || new Date())
                                }
                                className="rounded-md border bg-white shadow-md"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex items-end">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 cursor-pointer"
                    >
                        {loading ? 'Đang tìm...' : 'Tìm chuyến bay'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
