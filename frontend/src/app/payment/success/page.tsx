'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserIdFromLocalStorage } from '@/lib/utils';
import { useBookingDetail } from '@/queries/useBooking';
import { useCreateMultipleTicketsMutation } from '@/queries/useTicket';
import { toast } from 'sonner';
import { BookingDetailType } from '@/schemaValidations/bookings.schema';
import { AircraftClass } from '@/constants/aircrafts';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingId = searchParams.get('bookingId');
    const userId = getUserIdFromLocalStorage();

    const { data, isLoading } = useBookingDetail(bookingId || '');
    const booking =
        (data?.payload?.metadata?.booking as BookingDetailType) || [];

    const [creatingTickets, setCreatingTickets] = useState(false);

    const { mutate: createTickets } = useCreateMultipleTicketsMutation();

    useEffect(() => {
        if (!bookingId) {
            toast.error('Không tìm thấy thông tin đặt vé.');
            router.push('/flights');
        }
    }, [bookingId, router]);

    const handleCreateTickets = () => {
        if (!bookingId || !userId) {
            toast.error('Thiếu thông tin booking hoặc người dùng.');
            router.push('/flights');
            return;
        }

        setCreatingTickets(true);

        const passengersJson = sessionStorage.getItem('passengers');
        if (!passengersJson) {
            toast.error('Không tìm thấy thông tin hành khách.');
            setCreatingTickets(false);
            return;
        }

        const passengers = JSON.parse(passengersJson);
        if (!passengers.length) {
            toast.error('Không tìm thấy thông tin hành khách.');
            setCreatingTickets(false);
            return;
        }

        const ticketsPayload = passengers.map((p: any) => ({
            passenger: p,
            price: booking.totalPrice / booking.quantity,
        }));

        createTickets(
            {
                userId,
                bookingId,
                flightId: booking.goFlightId!,
                seatClass: booking.seatClassGo as AircraftClass,
                tickets: ticketsPayload,
            },
            {
                onSuccess: () => {
                    alert('Tạo vé thành công!');
                    router.push(`/`);
                },
                onError: () => {
                    alert('Tạo vé thất bại. Vui lòng thử lại.');
                },
                onSettled: () => {
                    setCreatingTickets(false);
                },
            }
        );
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow space-y-6">
            <h1 className="text-2xl font-bold text-green-600 text-center">
                Thanh toán thành công!
            </h1>

            {isLoading ? (
                <Skeleton className="h-[150px] rounded-lg" />
            ) : (
                <>
                    <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
                        <p className="text-sm text-gray-600">
                            Mã booking:{' '}
                            <span className="font-semibold">{bookingId}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Tổng tiền:{' '}
                            <span className="font-semibold text-orange-500">
                                {booking.totalPrice?.toLocaleString('vi-VN')} ₫
                            </span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Số lượng hành khách:{' '}
                            <span className="font-semibold">
                                {booking.quantity}
                            </span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Trạng thái thanh toán:{' '}
                            <span className="font-semibold text-green-600">
                                {booking.paymentStatus?.toUpperCase()}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-center gap-4 mt-4">
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={handleCreateTickets}
                            disabled={creatingTickets}
                        >
                            {creatingTickets ? 'Đang tạo vé...' : 'Tạo vé ngay'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/flights')}
                        >
                            Tiếp tục đặt vé
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
