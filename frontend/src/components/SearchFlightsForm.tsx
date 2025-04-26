'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { fetchAirports, searchFlights } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const formSchema = z.object({
    type: z.enum(['khu-hoi', 'mot-chieu']),
    from: z.string().min(1, 'Chọn điểm đi'),
    to: z.string().min(1, 'Chọn điểm đến'),
    departureDate: z.date({ required_error: 'Chọn ngày đi' }),
    returnDate: z.date().optional(),
    passengers: z.coerce
        .number()
        .min(1, 'Ít nhất 1 người')
        .max(9, 'Tối đa 9 người'),
});

type FormData = z.infer<typeof formSchema>;

type Airport = {
    code: string;
    city: string;
    country: string;
};

export default function SearchFlightsForm() {
    const router = useRouter();
    const [tripType, setTripType] = useState<'khu-hoi' | 'mot-chieu'>(
        'khu-hoi'
    );
    const [airports, setAirports] = useState<Airport[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'khu-hoi',
            passengers: 1,
        },
    });

    const departureDate = watch('departureDate');
    const returnDate = watch('returnDate');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchAirports();
                setAirports(data.airports);
            } catch (error) {
                console.error('Không lấy được danh sách sân bay:', error);
                toast.error(
                    'Không thể tải danh sách sân bay. Vui lòng thử lại sau.'
                );
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            const searchParams = {
                from: data.from,
                to: data.to,
                departureDate: format(data.departureDate, 'yyyy-MM-dd'),
                returnDate: data.returnDate
                    ? format(data.returnDate, 'yyyy-MM-dd')
                    : undefined,
                passengers: data.passengers,
            };

            const flights = await searchFlights(searchParams);
            console.log('🔍 Kết quả tìm kiếm:', flights);
            // Chuyển hướng đến trang kết quả tìm kiếm
            router.push(
                `/flights?from=${data.from}&to=${data.to}&departureDate=${searchParams.departureDate}&returnDate=${searchParams.returnDate}&passengers=${data.passengers}`
            );
        } catch (error) {
            console.error('Lỗi khi tìm kiếm chuyến bay:', error);
            toast.error('Không thể tìm kiếm chuyến bay. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl shadow-xl max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 border border-gray-100"
        >
            <Tabs
                defaultValue="khu-hoi"
                onValueChange={(val) => {
                    setTripType(val as 'khu-hoi' | 'mot-chieu');
                    setValue('type', val as 'khu-hoi' | 'mot-chieu');
                }}
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="khu-hoi">Khứ hồi</TabsTrigger>
                    <TabsTrigger value="mot-chieu">Một chiều</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                {/* Điểm đi */}
                <div>
                    <label className="text-sm">Điểm đi</label>
                    <select
                        {...register('from')}
                        className="w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base"
                    >
                        <option value="">Chọn thành phố đi</option>
                        {airports.map((a) => (
                            <option key={a.code} value={a.code}>
                                {a.city} ({a.code})
                            </option>
                        ))}
                    </select>
                    {errors.from && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.from.message}
                        </p>
                    )}
                </div>

                {/* Điểm đến */}
                <div>
                    <label className="text-sm">Điểm đến</label>
                    <select
                        {...register('to')}
                        className="w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base"
                    >
                        <option value="">Chọn thành phố đến</option>
                        {airports.map((a) => (
                            <option key={a.code} value={a.code}>
                                {a.city} ({a.code})
                            </option>
                        ))}
                    </select>
                    {errors.to && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.to.message}
                        </p>
                    )}
                </div>

                {/* Ngày đi */}
                <div>
                    <label className="text-sm">Ngày đi</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal mt-1 text-sm sm:text-base',
                                    !departureDate && 'text-muted-foreground'
                                )}
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
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.departureDate && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.departureDate.message}
                        </p>
                    )}
                </div>

                {/* Ngày về */}
                {tripType === 'khu-hoi' && (
                    <div>
                        <label className="text-sm">Ngày về</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal mt-1 text-sm sm:text-base',
                                        !returnDate && 'text-muted-foreground'
                                    )}
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
                                    disabled={(date) =>
                                        date < (departureDate || new Date())
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {/* Hành khách */}
                <div>
                    <label className="text-sm">Số hành khách</label>
                    <Input
                        type="number"
                        min={1}
                        max={9}
                        {...register('passengers')}
                        className="text-sm sm:text-base"
                    />
                    {errors.passengers && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.passengers.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Nút */}
            <div className="text-center">
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 px-4 sm:px-6 py-2 text-white text-sm sm:text-base"
                >
                    {loading ? 'Đang tìm...' : 'Tìm chuyến bay'}
                </Button>
            </div>
        </form>
    );
}
