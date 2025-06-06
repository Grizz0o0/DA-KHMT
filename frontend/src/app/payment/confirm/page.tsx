'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CreateBookingTypeBody } from '@/schemaValidations/bookings.schema';
import { useEffect } from 'react';
import { useCreateBookingMutation } from '@/queries/useBooking';
import { usePaymentWithMomoMutation } from '@/queries/usePayment';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserIdFromLocalStorage } from '@/lib/utils';
import { AircraftClass } from '@/constants/aircrafts';
import { PaymentMethod } from '@/constants/payments';
import { toast } from 'sonner';
export default function PaymentConfirmPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const goId = searchParams.get('goId');
    const returnId = searchParams.get('returnId');
    const passengerCount = parseInt(
        searchParams.get('passengerCount') || '1',
        10
    );
    const seatClassGo = searchParams.get('seatClassGo');
    const seatClassReturn = searchParams.get('seatClassReturn');
    const finalPrice = parseInt(searchParams.get('finalPrice') || '0', 10);
    const paymentMethod = searchParams.get('method');

    const userId = getUserIdFromLocalStorage();

    const { mutate: createBooking } = useCreateBookingMutation();
    const { mutate: paymentWithMomo } = usePaymentWithMomoMutation();

    useEffect(() => {
        // Validate dữ liệu cơ bản
        if (!goId || !seatClassGo || !paymentMethod || finalPrice <= 0) {
            toast.error(
                'Dữ liệu thanh toán không hợp lệ. Vui lòng quay lại chọn vé.'
            );
            router.push('/flights');
            return;
        }

        if (isNaN(passengerCount) || passengerCount < 1) {
            toast.error('Số lượng hành khách không hợp lệ.');
            router.push('/flights');
            return;
        }

        if (
            !Object.values(AircraftClass).includes(seatClassGo as AircraftClass)
        ) {
            toast.error('Hạng ghế chiều đi không hợp lệ.');
            router.push('/flights');
            return;
        }

        if (!userId) {
            toast.error('Vui lòng đăng nhập trước khi thanh toán.');
            router.push('/login');
            return;
        }

        // Nếu có vé khứ hồi thì validate seatClassReturn
        if (returnId && !seatClassReturn) {
            toast.error('Hạng ghế chiều về không hợp lệ.');
            router.push('/flights');
            return;
        }

        const createBookingFlow = async () => {
            const bookingPayload: CreateBookingTypeBody = {
                userId,
                goFlightId: goId,
                seatClassGo: seatClassGo as AircraftClass,
                quantity: passengerCount,
                totalPrice: finalPrice,
            };

            if (returnId && seatClassReturn) {
                bookingPayload.returnFlightId = returnId;
                bookingPayload.seatClassReturn =
                    seatClassReturn as AircraftClass;
            }

            createBooking(bookingPayload, {
                onSuccess: (bookingData) => {
                    const bookingId =
                        bookingData?.payload?.metadata?.booking?._id;
                    if (!bookingId) {
                        toast.error('Tạo booking thất bại.');
                        router.push('/flights');
                        return;
                    }

                    const lang: 'vi' | 'en' = 'vi';
                    const paymentBody = {
                        bookingId,
                        userId,
                        amount: finalPrice,
                        orderId: `BOOKING-${bookingId}`,
                        orderInfo: `Thanh toán vé máy bay - booking ${bookingId}`,
                        lang,
                        paymentMethod: paymentMethod as PaymentMethod,
                    };
                    paymentWithMomo(paymentBody, {
                        onSuccess: (paymentResponse) => {
                            window.location.href =
                                paymentResponse.payUrl ||
                                paymentResponse.shortLink;
                        },
                        onError: () => {
                            toast.error(
                                'Tạo thanh toán thất bại. Vui lòng thử lại.'
                            );
                            router.push('/flights');
                        },
                    });
                },
                onError: () => {
                    toast.error('Tạo booking thất bại. Vui lòng thử lại.');
                    router.push('/flights');
                },
            });
        };

        createBookingFlow();
    }, [
        goId,
        returnId,
        seatClassGo,
        seatClassReturn,
        paymentMethod,
        finalPrice,
        passengerCount,
        userId,
        createBooking,
        paymentWithMomo,
        router,
    ]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Skeleton className="h-[200px] w-[200px] rounded-xl" />
            <p className="ml-4 text-lg text-gray-600">
                Đang xử lý thanh toán...
            </p>
        </div>
    );
}
