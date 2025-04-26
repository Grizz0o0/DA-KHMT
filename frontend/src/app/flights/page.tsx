'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { searchFlights } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

type Flight = {
    _id: string;
    flightNumber: string;
    departureAirport: {
        code: string;
        city: string;
    };
    arrivalAirport: {
        code: string;
        city: string;
    };
    departureTime: string;
    arrivalTime: string;
    price: number;
    availableSeats: number;
    airline: {
        name: string;
        logo: string;
    };
};

type SearchParams = {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
};

function FlightsPage() {
    const params = useSearchParams();
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                setLoading(true);
                const from = params.get('from');
                const to = params.get('to');
                const departureDate = params.get('departureDate');
                const returnDate = params.get('returnDate');
                const passengers = params.get('passengers');

                if (!from || !to || !departureDate || !passengers) {
                    throw new Error('Thiếu thông tin tìm kiếm');
                }

                const searchParams: SearchParams = {
                    from,
                    to,
                    departureDate,
                    returnDate: returnDate || undefined,
                    passengers: parseInt(passengers),
                };

                const data = await searchFlights(searchParams);
                setFlights(data);
            } catch (err) {
                console.error('Lỗi khi tìm kiếm chuyến bay:', err);
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
                toast.error(
                    'Không thể tìm kiếm chuyến bay. Vui lòng thử lại sau.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFlights();
    }, [params]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">
                        Lỗi
                    </h2>
                    <p className="text-gray-600">{error}</p>
                    <Button
                        className="mt-4"
                        onClick={() => window.history.back()}
                    >
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    if (flights.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Không tìm thấy chuyến bay phù hợp
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Vui lòng thử lại với các tiêu chí khác
                    </p>
                    <Button
                        className="mt-4"
                        onClick={() => window.history.back()}
                    >
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Kết quả tìm kiếm chuyến bay
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Từ {flights[0].departureAirport.city} (
                        {flights[0].departureAirport.code}) đến{' '}
                        {flights[0].arrivalAirport.city} (
                        {flights[0].arrivalAirport.code})
                    </p>
                </div>

                <div className="space-y-4">
                    {flights.map((flight) => (
                        <div
                            key={flight._id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Image
                                        src={flight.airline.logo}
                                        alt={flight.airline.name}
                                        className="h-12 w-12 object-contain"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {flight.airline.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {flight.flightNumber}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-2xl font-bold text-orange-500">
                                        {flight.price.toLocaleString('vi-VN')}{' '}
                                        VNĐ
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Còn {flight.availableSeats} ghế
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-lg font-semibold">
                                        {format(
                                            new Date(flight.departureTime),
                                            'HH:mm'
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {format(
                                            new Date(flight.departureTime),
                                            'EEEE, dd/MM/yyyy',
                                            {
                                                locale: vi,
                                            }
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {flight.departureAirport.code}
                                    </p>
                                </div>

                                <div className="flex-1 px-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white px-2 text-sm text-gray-500">
                                                {Math.floor(
                                                    (new Date(
                                                        flight.arrivalTime
                                                    ).getTime() -
                                                        new Date(
                                                            flight.departureTime
                                                        ).getTime()) /
                                                        (1000 * 60 * 60)
                                                )}{' '}
                                                giờ
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-lg font-semibold">
                                        {format(
                                            new Date(flight.arrivalTime),
                                            'HH:mm'
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {format(
                                            new Date(flight.arrivalTime),
                                            'EEEE, dd/MM/yyyy',
                                            {
                                                locale: vi,
                                            }
                                        )}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {flight.arrivalAirport.code}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={() => {
                                        // Xử lý đặt vé
                                        console.log('Đặt vé:', flight._id);
                                    }}
                                >
                                    Đặt vé
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FlightsPage;
