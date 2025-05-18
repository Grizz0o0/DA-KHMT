'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    SearchFlightReqSchema,
    type FlightDetailType,
} from '@/schemaValidations/flights.schema';
import flightApiRequest from '@/app/apiRequests/flight';

const parseSearchParams = (params: URLSearchParams) => {
    const obj = {
        departureAirport: params.get('from') || '',
        arrivalAirport: params.get('to') || '',
        departureTime: params.get('departureDate') || '',
        arrivalTime: params.get('returnDate') || '',
        passengerCount: params.get('passengers') || '1',
    };

    const result = SearchFlightReqSchema.safeParse(obj);
    if (!result.success) {
        throw new Error('Thông tin tìm kiếm không hợp lệ');
    }
    return result.data;
};

const useSearchFlights = (params: URLSearchParams) => {
    return useQuery({
        queryKey: ['flights', params.toString()],
        queryFn: async () => {
            const query = parseSearchParams(params);
            const res = await flightApiRequest.getFlights(query); // gọi /search phía backend
            return res.metadata.flights as FlightDetailType[];
        },
        enabled: !!params,
        staleTime: 5 * 60 * 1000,
        onError: () => {
            toast.error('Không thể tìm kiếm chuyến bay. Vui lòng thử lại.');
        },
    });
};

export default function FlightsPage() {
    const params = useSearchParams();
    const {
        data: flights,
        isLoading,
        isError,
        error,
    } = useSearchFlights(params);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (isError || !flights) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-red-500 mb-2">Lỗi</h2>
                <p className="text-gray-600">
                    {(error as Error)?.message || 'Đã xảy ra lỗi'}
                </p>
                <Button className="mt-4" onClick={() => window.history.back()}>
                    Quay lại
                </Button>
            </div>
        );
    }

    if (flights.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Không tìm thấy chuyến bay phù hợp
                </h2>
                <p className="text-gray-600">
                    Vui lòng thử lại với các tiêu chí khác
                </p>
                <Button className="mt-4" onClick={() => window.history.back()}>
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">
                        Kết quả tìm kiếm chuyến bay
                    </h1>
                </div>

                <div className="space-y-4">
                    {flights.map((flight) => (
                        <div
                            key={flight._id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src="/placeholder-airline-logo.png" // nếu chưa có logo thực
                                        alt="Airline"
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                    />
                                    <div>
                                        <p className="text-lg font-semibold">
                                            {flight.flightNumber}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {flight.departureAirportId} →{' '}
                                            {flight.arrivalAirportId}
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

                            <div className="mt-4 flex justify-between items-center text-center">
                                <div>
                                    <p className="text-lg font-semibold">
                                        {format(
                                            new Date(flight.departureTime),
                                            'HH:mm'
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {format(
                                            new Date(flight.departureTime),
                                            'dd/MM/yyyy',
                                            { locale: vi }
                                        )}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    ~ {flight.duration} giờ
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">
                                        {format(
                                            new Date(flight.arrivalTime),
                                            'HH:mm'
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {format(
                                            new Date(flight.arrivalTime),
                                            'dd/MM/yyyy',
                                            { locale: vi }
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={() =>
                                        console.log('Đặt vé', flight._id)
                                    }
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
