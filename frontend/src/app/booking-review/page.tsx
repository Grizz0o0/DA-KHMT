'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFlightDetail } from '@/queries/useFlight';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FlightPopulatedType } from '@/schemaValidations/flights.schema';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { AircraftClass } from '@/constants/aircrafts';

function formatTime(date: string) {
    return format(new Date(date), 'HH:mm', { locale: vi });
}

function formatMinutes(mins: number) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
}

function createQueryStringFromFlight(flight: any) {
    const params = new URLSearchParams();
    params.set('type', 'khu-hoi');
    params.set('departureAirportCode', flight.departureAirport.code);
    params.set('arrivalAirportCode', flight.arrivalAirport.code);
    params.set('departureTime', flight.departureTime.split('T')[0]);
    params.set('returnTime', flight.arrivalTime.split('T')[0]);
    params.set('passengerCount', '1');
    params.set('class', flight.fareOptions?.[0]?.class || 'economy');
    return params.toString();
}

const seatClassLabel: Record<AircraftClass, string> = {
    [AircraftClass.Economy]: 'Phổ thông',
    [AircraftClass.Business]: 'Thương gia',
    [AircraftClass.FirstClass]: 'Hạng nhất',
};

export default function BookingReviewPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const goId = searchParams.get('goId');
    const returnId = searchParams.get('returnId');
    const passengerCount = parseInt(
        searchParams.get('passengerCount') || '1',
        10
    );

    const { data: goData, isLoading: isGoLoading } = useFlightDetail(
        goId || ''
    );
    const { data: returnData, isLoading: isReturnLoading } = useFlightDetail(
        returnId || '',
        { enabled: !!returnId }
    );

    const goFlight = goData?.payload?.metadata?.flight as
        | FlightPopulatedType
        | undefined;
    const returnFlight = returnData?.payload?.metadata?.flight as
        | FlightPopulatedType
        | undefined;

    useEffect(() => {
        if (!goId) {
            router.push('/flights');
        }
    }, [goId, router]);

    const isLoading = isGoLoading || (returnId && isReturnLoading);

    const [seatClassGo, setSeatClassGo] = useState<AircraftClass | ''>('');
    const [seatClassReturn, setSeatClassReturn] = useState<AircraftClass | ''>(
        ''
    );

    useEffect(() => {
        if (!seatClassGo && goFlight?.fareOptions?.length) {
            setSeatClassGo(goFlight.fareOptions[0].class as AircraftClass);
        }
    }, [goFlight, seatClassGo]);

    useEffect(() => {
        if (!seatClassReturn && returnFlight?.fareOptions?.length) {
            setSeatClassReturn(
                returnFlight.fareOptions[0].class as AircraftClass
            );
        }
    }, [returnFlight, seatClassReturn]);

    const getSelectedOption = (
        flight: FlightPopulatedType | undefined,
        selectedClass: AircraftClass | ''
    ) => {
        return flight?.fareOptions?.find((f) => f.class === selectedClass);
    };

    const totalPricePerPassenger =
        (getSelectedOption(goFlight, seatClassGo)?.price || 0) +
        (getSelectedOption(returnFlight, seatClassReturn)?.price || 0);

    const totalPrice = totalPricePerPassenger * passengerCount;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
                </Button>
                <h1 className="text-2xl font-semibold text-center w-full">
                    Xác nhận chuyến bay
                </h1>
            </div>

            {isLoading ? (
                <Skeleton className="h-[300px] rounded-xl" />
            ) : (
                <>
                    {goFlight && (
                        <div className="border rounded-xl p-4 bg-white">
                            <h3 className="font-medium text-lg text-gray-700 mb-3">
                                Chiều đi
                            </h3>
                            <div className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="text-base font-semibold text-blue-500">
                                        {goFlight.airline?.name}
                                    </p>
                                    <p>
                                        {goFlight.departureAirport?.city} →{' '}
                                        {goFlight.arrivalAirport?.city}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {goFlight.departureAirport?.name} →{' '}
                                        {goFlight.arrivalAirport?.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {formatTime(goFlight.departureTime)} -{' '}
                                        {formatTime(goFlight.arrivalTime)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatMinutes(goFlight.duration)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 space-y-2">
                                <Tabs
                                    value={seatClassGo}
                                    onValueChange={(v) =>
                                        setSeatClassGo(v as AircraftClass)
                                    }
                                >
                                    <TabsList>
                                        {goFlight.fareOptions
                                            ?.filter((f) =>
                                                Object.values(
                                                    AircraftClass
                                                ).includes(
                                                    f.class as AircraftClass
                                                )
                                            )
                                            .map((f) => (
                                                <TabsTrigger
                                                    key={f.class}
                                                    value={f.class}
                                                    className="cursor-pointer"
                                                >
                                                    {
                                                        seatClassLabel[
                                                            f.class as AircraftClass
                                                        ]
                                                    }
                                                </TabsTrigger>
                                            ))}
                                    </TabsList>
                                </Tabs>
                                {seatClassGo && (
                                    <>
                                        <p className="text-orange-500 font-semibold">
                                            Giá vé:{' '}
                                            {(
                                                getSelectedOption(
                                                    goFlight,
                                                    seatClassGo
                                                )?.price || 0
                                            ).toLocaleString('vi-VN')}{' '}
                                            VND
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                                            {getSelectedOption(
                                                goFlight,
                                                seatClassGo
                                            )?.perks?.map((perk, i) => (
                                                <li key={i}>{perk}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                className="mt-4 cursor-pointer"
                                onClick={() =>
                                    router.push(
                                        `/flights?mode=edit-go&returnId=${
                                            returnId || ''
                                        }&${createQueryStringFromFlight(
                                            goFlight
                                        )}`
                                    )
                                }
                            >
                                Thay đổi chuyến đi
                            </Button>
                        </div>
                    )}

                    {returnFlight && (
                        <div className="border rounded-xl p-4 bg-white">
                            <h3 className="font-medium text-lg text-gray-700 mb-3">
                                Chiều về
                            </h3>
                            <div className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="text-base font-semibold text-blue-500">
                                        {returnFlight.airline?.name}
                                    </p>
                                    <p>
                                        {returnFlight.departureAirport?.city} →{' '}
                                        {returnFlight.arrivalAirport?.city}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {returnFlight.departureAirport?.name} →{' '}
                                        {returnFlight.arrivalAirport?.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {formatTime(returnFlight.departureTime)}{' '}
                                        - {formatTime(returnFlight.arrivalTime)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatMinutes(returnFlight.duration)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 space-y-2">
                                <Tabs
                                    value={seatClassReturn}
                                    onValueChange={(v) =>
                                        setSeatClassReturn(v as AircraftClass)
                                    }
                                >
                                    <TabsList>
                                        {returnFlight.fareOptions
                                            ?.filter((f) =>
                                                Object.values(
                                                    AircraftClass
                                                ).includes(
                                                    f.class as AircraftClass
                                                )
                                            )
                                            .map((f) => (
                                                <TabsTrigger
                                                    key={f.class}
                                                    value={f.class}
                                                >
                                                    {
                                                        seatClassLabel[
                                                            f.class as AircraftClass
                                                        ]
                                                    }
                                                </TabsTrigger>
                                            ))}
                                    </TabsList>
                                </Tabs>
                                {seatClassReturn && (
                                    <>
                                        <p className="text-orange-500 font-semibold">
                                            Giá vé:{' '}
                                            {(
                                                getSelectedOption(
                                                    returnFlight,
                                                    seatClassReturn
                                                )?.price || 0
                                            ).toLocaleString('vi-VN')}{' '}
                                            VND
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                                            {getSelectedOption(
                                                returnFlight,
                                                seatClassReturn
                                            )?.perks?.map((perk, i) => (
                                                <li key={i}>{perk}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                className="mt-4 cursor-pointer"
                                onClick={() =>
                                    router.push(
                                        `/flights?mode=edit-return&goId=${goId}&${createQueryStringFromFlight(
                                            returnFlight
                                        )}`
                                    )
                                }
                            >
                                Thay đổi chuyến về
                            </Button>
                        </div>
                    )}

                    <div className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                            <p className="text-base font-semibold text-orange-500">
                                {totalPricePerPassenger.toLocaleString('vi-VN')}{' '}
                                VND
                                <span className="text-sm text-gray-500 ml-1">
                                    /khách
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Tổng giá {totalPrice.toLocaleString('vi-VN')}{' '}
                                VND cho {passengerCount} người
                            </p>
                        </div>
                        <Button
                            className="mt-4 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                            onClick={() => {
                                const query = new URLSearchParams();
                                query.set('goId', goId!);
                                if (returnId) query.set('returnId', returnId);
                                query.set(
                                    'passengerCount',
                                    passengerCount.toString()
                                );
                                if (seatClassGo)
                                    query.set('seatClassGo', seatClassGo);
                                if (seatClassReturn)
                                    query.set(
                                        'seatClassReturn',
                                        seatClassReturn
                                    );
                                router.push(`/checkout?${query.toString()}`);
                            }}
                        >
                            Tiếp tục đặt vé
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
