'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AircraftClass } from '@/constants/aircrafts';
import { FlightPopulatedType } from '@/schemaValidations/flights.schema';
import {
    passengerFormSchema,
    PassengerFormType,
} from '@/schemaValidations/tickets.schema';
import PassengerForm from '@/components/form/PassengerForm';
import { useFlightDetail } from '@/queries/useFlight';

function formatTime(date: string) {
    return format(new Date(date), 'HH:mm');
}

function formatDate(date: string) {
    return format(new Date(date), 'EEEE, dd MMM yyyy', { locale: vi });
}

function formatDuration(flight: FlightPopulatedType) {
    const start = new Date(flight.departureTime);
    const end = new Date(flight.arrivalTime);
    const mins = Math.floor((end.getTime() - start.getTime()) / 60000);
    return `${Math.floor(mins / 60)} giờ ${mins % 60} phút`;
}

const seatClassLabel: Record<AircraftClass, string> = {
    [AircraftClass.Economy]: 'Phổ thông',
    [AircraftClass.Business]: 'Thương gia',
    [AircraftClass.FirstClass]: 'Hạng nhất',
};

export default function FlightDetailPage() {
    const { flightId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const passengerCount = parseInt(
        searchParams.get('passengerCount') || '1',
        10
    );

    const [seatClass, setSeatClass] = useState<AircraftClass | ''>('');

    const { data, isLoading } = useFlightDetail(flightId as string);
    const flight = data?.payload?.metadata?.flight as
        | FlightPopulatedType
        | undefined;

    const validClass = (cls: string): cls is AircraftClass =>
        Object.values(AircraftClass).includes(cls as AircraftClass);

    useEffect(() => {
        if (!seatClass && flight?.fareOptions?.length) {
            const firstClass = flight.fareOptions[0].class;
            if (validClass(firstClass)) {
                setSeatClass(firstClass);
            }
        }
    }, [flight, seatClass]);

    const methods = useForm<PassengerFormType>({
        resolver: zodResolver(passengerFormSchema),
        defaultValues: { passengers: [] },
    });

    const handlePassengerSubmit = (data: PassengerFormType) => {
        // TODO: Handle submit here (e.g. navigate to payment)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading || !flight) {
        return (
            <Skeleton className="h-[300px] rounded-xl max-w-6xl mx-auto mt-8" />
        );
    }

    const selectedOption = flight.fareOptions?.find(
        (f) => f.class === seatClass
    );
    const basePrice = selectedOption?.price ?? 0;

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Flight Summary */}
                <div className="border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-4 items-center">
                            <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center font-semibold">
                                {flight.airline?.code}
                            </div>
                            <div>
                                <p className="font-medium">
                                    {flight.airline?.name}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {flight.flightNumber}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="w-4 h-4" />
                            {formatDate(flight.departureTime)}
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-center">
                        <div>
                            <p className="text-2xl font-bold">
                                {formatTime(flight.departureTime)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {flight.departureAirport?.name || '---'}
                            </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>{formatDuration(flight)}</p>
                            <p className="text-2xl">🛫</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {formatTime(flight.arrivalTime)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {flight.arrivalAirport?.name || '---'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Flight Detail */}
                <div className="border rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-lg">
                        Thông tin chuyến bay
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Điểm đi</p>
                            <p>
                                {flight.departureAirport?.city} -{' '}
                                {flight.departureAirport?.name}
                            </p>
                            <p className="text-xs">
                                {formatTime(flight.departureTime)},{' '}
                                {formatDate(flight.departureTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Điểm đến</p>
                            <p>
                                {flight.arrivalAirport?.city} -{' '}
                                {flight.arrivalAirport?.name}
                            </p>
                            <p className="text-xs">
                                {formatTime(flight.arrivalTime)},{' '}
                                {formatDate(flight.arrivalTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Thời lượng</p>
                            <p>{formatDuration(flight)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Máy bay</p>
                            <p>{flight.aircraft?.model}</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        {seatClass && (
                            <Tabs
                                value={seatClass}
                                onValueChange={(v) =>
                                    setSeatClass(v as AircraftClass)
                                }
                            >
                                <TabsList>
                                    {flight.fareOptions
                                        ?.filter((f) => validClass(f.class))
                                        .map((f) => (
                                            <TabsTrigger
                                                key={f.class}
                                                value={f.class}
                                            >
                                                {seatClassLabel[
                                                    f.class as AircraftClass
                                                ] ?? f.class}
                                            </TabsTrigger>
                                        ))}
                                </TabsList>
                            </Tabs>
                        )}
                        <ul className="list-disc list-inside mt-4 text-sm text-muted-foreground">
                            {selectedOption?.perks?.map(
                                (p: string, i: number) => (
                                    <li key={i}>{p}</li>
                                )
                            )}
                        </ul>
                        {selectedOption?.availableSeats !== undefined && (
                            <p className="text-sm text-orange-500 mt-2">
                                Còn lại {selectedOption.availableSeats} chỗ
                            </p>
                        )}
                    </div>
                </div>

                {/* Passenger Form */}
                <div className="border rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-lg">
                        Thông tin hành khách
                    </h3>
                    <FormProvider {...methods}>
                        <PassengerForm totalPassengers={passengerCount} />
                        <Button
                            className="mt-4 bg-orange-500 hover:bg-orange-600 w-full hidden md:block"
                            onClick={methods.handleSubmit((data) => {
                                handlePassengerSubmit(data);
                            })}
                        >
                            Tiếp tục thanh toán
                        </Button>
                    </FormProvider>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
                <div className="border rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Giá cuối cùng</h3>
                    <div className="text-lg font-semibold text-primary text-right">
                        {basePrice.toLocaleString('vi-VN')} ₫
                    </div>
                    <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                        Đặt vé ngay
                    </Button>
                    <ul className="text-xs mt-3 text-muted-foreground list-disc list-inside space-y-1">
                        <li>✔ Hủy miễn phí trong 24 giờ</li>
                        <li>✔ Thanh toán an toàn</li>
                    </ul>
                </div>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                >
                    Quay lại kết quả
                </Button>
            </div>
        </div>
    );
}
