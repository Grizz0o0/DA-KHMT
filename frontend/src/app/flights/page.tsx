'use client';

import SearchFlightsForm from '@/components/SearchFlightsForm';
import { FlightFilterSidebar } from '@/app/flights/_component/FlightFilterSidebar';
import FlightCard from '@/app/flights/_component/FlightCard';
import { useFilterFlights } from '@/queries/useFlight';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { useMemo, useState } from 'react';
import { AircraftClass } from '@/constants/aircrafts';
import { Button } from '@/components/ui/button';
import {
    FlightDetailType,
    FlightPopulatedType,
} from '@/schemaValidations/flights.schema';

export default function FlightsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const type = searchParams.get('type') ?? 'mot-chieu';
    const mode = searchParams.get('mode'); // edit-go | edit-return
    const goId = searchParams.get('goId');
    const returnId = searchParams.get('returnId');

    const query = useMemo(() => {
        const get = (key: string) => searchParams.get(key) || undefined;
        const airlineIds = get('airlineIds')?.split(',').filter(Boolean);

        return {
            departureAirportCode: get('departureAirportCode'),
            arrivalAirportCode: get('arrivalAirportCode'),
            departureTime: get('departureTime'),
            returnTime: get('returnTime'),
            passengerCount: get('passengerCount') ?? 1,
            class: get('class') as AircraftClass,
            page: get('page') ?? 1,
            limit: get('limit') ?? 10,
            minHour: get('minHour') ?? 0,
            maxHour: get('maxHour') ?? 23,
            minPrice: get('minPrice') ?? 0,
            maxPrice: get('maxPrice') ?? 20000000,
            airlineIds,
            type,
        };
    }, [searchParams, type]);

    const { data, isLoading } = useFilterFlights(query);
    const isRoundTrip = query.type === 'khu-hoi';

    const {
        departingFlights = [],
        returningFlights = [],
        flights: oneWayFlights = [],
        pagination,
    } = useMemo(() => {
        const meta = data?.payload?.metadata;
        if (!meta) return {};

        if ('departingFlights' in meta && 'returningFlights' in meta) {
            return {
                departingFlights:
                    meta.departingFlights as FlightPopulatedType[],
                returningFlights:
                    meta.returningFlights as FlightPopulatedType[],
                pagination: meta.pagination,
            };
        }

        return {
            flights: meta.flights as FlightPopulatedType[],
            pagination: meta.pagination,
        };
    }, [data]);

    const [selectedGoFlight, setSelectedGoFlight] =
        useState<FlightDetailType | null>(null);

    const handleSelectFlight = (flight: FlightDetailType) => {
        const passengerCount = searchParams.get('passengerCount') || '1';
        if (mode === 'edit-go') {
            router.push(
                `/booking-review?goId=${flight._id}&returnId=${
                    returnId || ''
                }&passengerCount=${passengerCount}`
            );
        } else if (mode === 'edit-return') {
            router.push(
                `/booking-review?goId=${goId}&returnId=${flight._id}&passengerCount=${passengerCount}`
            );
        } else if (!isRoundTrip) {
            router.push(
                `/booking-review?goId=${flight._id}&passengerCount=${passengerCount}`
            );
        } else {
            if (!selectedGoFlight) {
                setSelectedGoFlight(flight);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                router.push(
                    `/booking-review?goId=${selectedGoFlight._id}&returnId=${flight._id}&passengerCount=${passengerCount}`
                );
            }
        }
    };

    const handlePageChange = (p: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', p.toString());
        const passengerCount = searchParams.get('passengerCount');
        if (passengerCount) {
            params.set('passengerCount', passengerCount);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.location.href = `/flights?${params.toString()}`;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-6 px-4">
                <section className="mb-6">
                    <SearchFlightsForm />
                    {(mode === 'edit-go' || mode === 'edit-return') && (
                        <div className="mb-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const query = new URLSearchParams();
                                    if (goId) query.set('goId', goId);
                                    if (returnId)
                                        query.set('returnId', returnId);
                                    const passengerCount =
                                        searchParams.get('passengerCount');
                                    if (passengerCount)
                                        query.set(
                                            'passengerCount',
                                            passengerCount
                                        );
                                    router.push(
                                        `/booking-review?${query.toString()}`
                                    );
                                }}
                            >
                                {mode === 'edit-go'
                                    ? 'Huỷ thay đổi chiều đi'
                                    : 'Huỷ thay đổi chiều về'}
                            </Button>
                        </div>
                    )}
                </section>

                <div className="flex flex-col lg:flex-row gap-6">
                    <aside className="w-full lg:w-[280px]">
                        <FlightFilterSidebar />
                    </aside>

                    <main className="flex-1 space-y-4">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-[120px] rounded-2xl"
                                />
                            ))
                        ) : mode === 'edit-go' ? (
                            departingFlights.map((f) => (
                                <FlightCard
                                    key={f._id}
                                    flight={f}
                                    onSelect={handleSelectFlight}
                                />
                            ))
                        ) : mode === 'edit-return' ? (
                            returningFlights.map((f) => (
                                <FlightCard
                                    key={f._id}
                                    flight={f}
                                    onSelect={handleSelectFlight}
                                />
                            ))
                        ) : isRoundTrip ? (
                            <>
                                <h3 className="font-semibold text-lg text-gray-700">
                                    Chiều đi
                                </h3>
                                {departingFlights.length > 0 ? (
                                    departingFlights.map((f) => (
                                        <FlightCard
                                            key={f._id}
                                            flight={f}
                                            selectedGoFlight={selectedGoFlight}
                                            onSelect={handleSelectFlight}
                                        />
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Không có chuyến đi phù hợp
                                    </p>
                                )}

                                {selectedGoFlight && (
                                    <>
                                        <h3 className="font-semibold text-lg text-gray-700 mt-6">
                                            Chiều về
                                        </h3>
                                        {returningFlights.length > 0 ? (
                                            returningFlights.map((f) => (
                                                <FlightCard
                                                    key={f._id}
                                                    flight={f}
                                                    selectedGoFlight={
                                                        selectedGoFlight
                                                    }
                                                    isReturnPhase
                                                    onSelect={
                                                        handleSelectFlight
                                                    }
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                Không có chuyến về phù hợp
                                            </p>
                                        )}
                                    </>
                                )}
                            </>
                        ) : oneWayFlights.length > 0 ? (
                            oneWayFlights.map((f) => (
                                <FlightCard
                                    key={f._id}
                                    flight={f}
                                    onSelect={handleSelectFlight}
                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-12 text-sm">
                                Không có chuyến bay nào phù hợp
                            </div>
                        )}

                        {pagination && (
                            <div className="flex justify-center mt-8">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() =>
                                                    handlePageChange(
                                                        Math.max(
                                                            pagination.page - 1,
                                                            1
                                                        )
                                                    )
                                                }
                                                className={
                                                    pagination.hasPrevPage
                                                        ? ''
                                                        : 'pointer-events-none opacity-50'
                                                }
                                            />
                                        </PaginationItem>
                                        {Array.from({
                                            length: pagination.totalPages,
                                        }).map((_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    isActive={
                                                        pagination.page ===
                                                        i + 1
                                                    }
                                                    onClick={() =>
                                                        handlePageChange(i + 1)
                                                    }
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() =>
                                                    handlePageChange(
                                                        pagination.page + 1
                                                    )
                                                }
                                                className={
                                                    pagination.hasNextPage
                                                        ? ''
                                                        : 'pointer-events-none opacity-50'
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
