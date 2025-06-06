'use client';
import { useRouter } from 'next/navigation';
import { useFlights } from '@/queries/useFlight';
import Image from 'next/image';
import { FlightPopulatedType } from '@/schemaValidations/flights.schema';
import { Button } from '@/components/ui/button';

const FlightList = () => {
    const { data, isLoading, error } = useFlights({
        page: 1,
        limit: 9,
    });
    const flights = data?.payload.metadata.flights ?? [];
    const router = useRouter();

    if (isLoading) {
        return <p className="text-center py-8">Đang tải dữ liệu...</p>;
    }

    if (error) {
        return (
            <p className="text-center py-8 text-red-500">
                Có lỗi xảy ra khi tải dữ liệu.
            </p>
        );
    }

    if (!data || flights.length === 0) {
        return (
            <p className="text-center py-8">Không tìm thấy chuyến bay nào.</p>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flights.slice(0, 6).map((flight: FlightPopulatedType) => (
                    <div
                        key={flight._id}
                        className="border rounded-lg shadow p-4 hover:shadow-md transition"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold">
                                {flight.flightNumber}
                            </h3>
                            <span
                                className={`px-2 py-1 rounded text-sm ${
                                    flight.isActive
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-red-100 text-red-600'
                                }`}
                            >
                                {flight.isActive
                                    ? 'Đang hoạt động'
                                    : 'Ngừng hoạt động'}
                            </span>
                        </div>

                        <div className="mb-2">
                            <p>
                                <strong>Điểm đi:</strong>{' '}
                                {flight.departureAirport.name} (
                                {flight.departureAirport.code})
                            </p>
                            <p>
                                <strong>Điểm đến:</strong>{' '}
                                {flight.arrivalAirport.name} (
                                {flight.arrivalAirport.code})
                            </p>
                        </div>

                        <div className="mb-2">
                            <p>
                                <strong>Giờ khởi hành:</strong>{' '}
                                {new Date(flight.departureTime).toLocaleString(
                                    'vi-VN'
                                )}
                            </p>
                            <p>
                                <strong>Giờ đến:</strong>{' '}
                                {new Date(flight.arrivalTime).toLocaleString(
                                    'vi-VN'
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Image
                                src={flight.airline.logo}
                                alt={flight.airline.name}
                                width={40}
                                height={40}
                                className="rounded"
                            />
                            <p>{flight.airline.name}</p>
                        </div>

                        <div className="mt-4">
                            <strong>Giá vé:</strong>{' '}
                            <span className="text-orange-500 font-bold">
                                {Math.min(
                                    ...flight.fareOptions.map((f) => f.price)
                                ).toLocaleString('vi-VN')}{' '}
                                VND
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Nút xem thêm */}
            <div className="flex justify-center mt-8">
                <Button
                    onClick={() => router.push('/flights')}
                    className="px-8 py-4 text-white rounded-lg transition cursor-pointer"
                >
                    Xem thêm
                </Button>
            </div>
        </>
    );
};

export default FlightList;
