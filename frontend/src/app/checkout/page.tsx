'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
import {
    useApplyPromoCodeMutation,
    useValidatePromoCodeMutation,
} from '@/queries/usePromoCode';
import { handleErrorClient } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

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

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const goId = searchParams.get('goId');
    const returnId = searchParams.get('returnId');
    const passengerCount = parseInt(
        searchParams.get('passengerCount') || '1',
        10
    );

    const [promoCode, setPromoCode] = useState<string>('');
    const [appliedPromoCode, setAppliedPromoCode] = useState<string>('');
    const [discount, setDiscount] = useState<number>(0);

    const applyPromoCodeMutation = useApplyPromoCodeMutation();
    const validatePromoCode = useValidatePromoCodeMutation();

    const seatClassGoParam = searchParams.get('seatClassGo') as AircraftClass;
    const seatClassReturnParam = searchParams.get(
        'seatClassReturn'
    ) as AircraftClass;

    const { data: goData, isLoading: isLoadingGo } = useFlightDetail(
        goId || ''
    );
    const { data: returnData, isLoading: isLoadingReturn } = useFlightDetail(
        returnId || '',
        { enabled: !!returnId }
    );

    const goFlight = goData?.payload?.metadata?.flight as
        | FlightPopulatedType
        | undefined;
    const returnFlight = returnData?.payload?.metadata?.flight as
        | FlightPopulatedType
        | undefined;

    const validClass = (cls: string): cls is AircraftClass =>
        Object.values(AircraftClass).includes(cls as AircraftClass);

    const [seatClassGo, setSeatClassGo] = useState<AircraftClass | ''>(
        seatClassGoParam || ''
    );
    const [seatClassReturn, setSeatClassReturn] = useState<AircraftClass | ''>(
        seatClassReturnParam || ''
    );

    useEffect(() => {
        if (goFlight?.fareOptions?.length) {
            const selectedOption = goFlight.fareOptions.find(
                (f) => f.class === seatClassGo
            );
            if (!selectedOption || selectedOption.availableSeats === 0) {
                const availableOption = goFlight.fareOptions.find(
                    (f) => f.availableSeats > 0
                );
                if (availableOption) {
                    setSeatClassGo(availableOption.class as AircraftClass);
                } else {
                    setSeatClassGo('');
                }
            }
        }
    }, [goFlight, seatClassGo]);

    useEffect(() => {
        if (returnFlight?.fareOptions?.length) {
            const selectedOption = returnFlight.fareOptions.find(
                (f) => f.class === seatClassReturn
            );
            if (!selectedOption || selectedOption.availableSeats === 0) {
                const availableOption = returnFlight.fareOptions.find(
                    (f) => f.availableSeats > 0
                );
                if (availableOption) {
                    setSeatClassReturn(availableOption.class as AircraftClass);
                } else {
                    setSeatClassReturn('');
                }
            }
        }
    }, [returnFlight, seatClassReturn]);

    const methods = useForm<PassengerFormType>({
        resolver: zodResolver(passengerFormSchema),
        defaultValues: { passengers: [] },
    });

    const passengerFormRef = useRef<HTMLDivElement>(null);

    const handleApplyPromoCode = async () => {
        try {
            const data = await validatePromoCode.mutateAsync(promoCode);

            const discountAmount = data.payload.metadata.discountAmount ?? 0;
            const discountPercentage =
                data.payload.metadata.discountPercentage ?? 0;

            // Ưu tiên discountAmount, nếu không có thì tính discountPercentage
            let calculatedDiscount = discountAmount;
            if (discountAmount === 0 && discountPercentage > 0) {
                const subtotal = totalPrice;
                calculatedDiscount = Math.floor(
                    (discountPercentage / 100) * subtotal
                );
            }

            setDiscount(calculatedDiscount);
            setAppliedPromoCode(promoCode); // giữ lại mã đã áp dụng
            setPromoCode(''); // clear input cho người dùng
            toast.success('Áp dụng mã khuyến mãi thành công!');
        } catch (error: any) {
            handleErrorClient(error);
        }
    };

    const handlePassengerSubmit = (data: PassengerFormType) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleProceedToPayment = async () => {
        const formValues = methods.getValues();
        const result = passengerFormSchema.safeParse(formValues);

        if (result.success) {
            const query = new URLSearchParams();
            query.set('goId', goId || '');
            if (returnId) query.set('returnId', returnId);
            query.set('passengerCount', passengerCount.toString());
            query.set('seatClassGo', seatClassGo);
            if (seatClassReturn) query.set('seatClassReturn', seatClassReturn);
            query.set('finalPrice', finalPrice.toString());
            if (appliedPromoCode) query.set('promoCode', appliedPromoCode);

            if (appliedPromoCode) {
                await applyPromoCodeMutation.mutateAsync(appliedPromoCode);
            }
            sessionStorage.setItem(
                'passengers',
                JSON.stringify(formValues.passengers)
            );

            try {
                if (appliedPromoCode) {
                    await applyPromoCodeMutation.mutateAsync(appliedPromoCode);
                }
                router.push(`/payment?${query.toString()}`);
            } catch (error: any) {
                handleErrorClient(error);
            }
        } else {
            passengerFormRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    if (isLoadingGo || (returnId && isLoadingReturn) || !goFlight) {
        return (
            <Skeleton className="h-[300px] rounded-xl max-w-6xl mx-auto mt-8" />
        );
    }

    const getSelectedPrice = (
        flight: FlightPopulatedType | undefined,
        selectedClass: AircraftClass | ''
    ): number => {
        if (!flight || !selectedClass) return 0;
        return (
            flight.fareOptions?.find((f) => f.class === selectedClass)?.price ??
            0
        );
    };

    const totalPricePerPassenger =
        getSelectedPrice(goFlight, seatClassGo) +
        getSelectedPrice(returnFlight, seatClassReturn);
    const totalPrice = totalPricePerPassenger * passengerCount;
    const finalPrice = Math.max(totalPrice - discount, 0);

    const renderFlightSection = (
        flight: FlightPopulatedType,
        title: string,
        seatClass: AircraftClass | '',
        setSeatClass: (val: AircraftClass) => void
    ) => {
        const selectedOption = flight.fareOptions?.find(
            (f) => f.class === seatClass
        );

        return (
            <div className="border rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg">{title}</h3>
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
                                    .map((f) => {
                                        const isSoldOut =
                                            f.availableSeats === 0;
                                        return (
                                            <TabsTrigger
                                                key={f.class}
                                                value={f.class}
                                                disabled={isSoldOut}
                                                className={
                                                    isSoldOut
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'cursor-pointer'
                                                }
                                            >
                                                {seatClassLabel[
                                                    f.class as AircraftClass
                                                ] ?? f.class}
                                            </TabsTrigger>
                                        );
                                    })}
                            </TabsList>
                        </Tabs>
                    )}
                    <ul className="list-disc list-inside mt-4 text-sm text-muted-foreground">
                        {selectedOption?.perks?.map((p, i) => (
                            <li key={i}>{p}</li>
                        ))}
                    </ul>
                    {selectedOption?.availableSeats !== undefined && (
                        <p className="text-sm text-orange-500 mt-2">
                            Còn lại {selectedOption.availableSeats} chỗ
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {renderFlightSection(
                    goFlight,
                    'Chuyến bay đi',
                    seatClassGo,
                    setSeatClassGo
                )}
                {returnFlight &&
                    renderFlightSection(
                        returnFlight,
                        'Chuyến bay về',
                        seatClassReturn,
                        setSeatClassReturn
                    )}

                {/* Passenger Form */}
                <div
                    ref={passengerFormRef}
                    className="border rounded-xl p-6 space-y-4"
                >
                    <h3 className="font-semibold text-lg">
                        Thông tin hành khách
                    </h3>
                    <FormProvider {...methods}>
                        <PassengerForm totalPassengers={passengerCount} />
                        <Button
                            className="mt-4 bg-orange-500 hover:bg-orange-600 w-full cursor-pointer"
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
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Nhập mã khuyến mãi"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                onClick={handleApplyPromoCode}
                                disabled={applyPromoCodeMutation.isPending}
                            >
                                Áp dụng
                            </Button>
                        </div>
                    </div>

                    <div className="text-lg font-semibold text-primary text-right">
                        {finalPrice.toLocaleString('vi-VN')} ₫
                    </div>
                    {discount > 0 && (
                        <p className="text-xs text-green-600 text-right">
                            Đã giảm {discount.toLocaleString('vi-VN')} ₫
                        </p>
                    )}
                    <Button
                        className="w-full mt-4 bg-orange-500 hover:bg-orange-600 cursor-pointer"
                        onClick={handleProceedToPayment}
                    >
                        Đặt vé ngay
                    </Button>
                    <ul className="text-xs mt-3 text-muted-foreground list-disc list-inside space-y-1">
                        <li>✔ Hủy miễn phí trong 24 giờ</li>
                        <li>✔ Thanh toán an toàn</li>
                    </ul>
                </div>
                <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={() => router.back()}
                >
                    Quay lại kết quả
                </Button>
            </div>
        </div>
    );
}
