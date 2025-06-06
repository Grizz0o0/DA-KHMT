'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlightCardProps {
    flight: any;
    selectedGoFlight?: any;
    isReturnPhase?: boolean;
    onSelect: (flight: any) => void;
}

function formatTime(date: string) {
    return format(new Date(date), 'HH:mm', { locale: vi });
}

function formatMinutes(mins: number) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
}

export default function FlightCard({
    flight,
    selectedGoFlight,
    isReturnPhase = false,
    onSelect,
}: FlightCardProps) {
    const fare = flight.fareOptions?.[0];
    const isSelected = flight._id === selectedGoFlight?._id;

    return (
        <div
            className={`flex items-center justify-between gap-6 border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition ${
                isSelected ? 'border-blue-500 bg-blue-50' : ''
            }`}
        >
            {/* Left: Logo + Info */}
            <div className="flex gap-4 items-center w-[30%] select-none">
                {flight.airline?.logo ? (
                    <Image
                        src={flight.airline.logo}
                        width={50}
                        height={50}
                        alt="Airline logo"
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="bg-gray-200 text-gray-600 rounded-full w-12 h-12 flex items-center justify-center font-semibold">
                        {flight.airline?.code || '?'}
                    </div>
                )}
                <div>
                    <p className="font-medium text-blue-600 text-base">
                        {flight.airline?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        {flight.flightNumber}
                    </p>
                </div>
            </div>

            {/* Center: Time */}
            <div className="flex flex-col items-center w-[40%]">
                <div className="flex items-center gap-2 text-xl font-semibold">
                    <span>{formatTime(flight.departureTime)}</span>
                    <span>—</span>
                    <span>{formatTime(flight.arrivalTime)}</span>
                </div>
                <span className="text-sm text-gray-500">
                    {formatMinutes(flight.duration)}
                </span>
                <div className="text-xs text-gray-700 mt-1">
                    {flight.departureAirport?.city} →{' '}
                    {flight.arrivalAirport?.city}
                </div>
                <div className="text-xs text-gray-500">
                    {flight.departureAirport?.name} →{' '}
                    {flight.arrivalAirport?.name}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                    {flight.aircraft?.manufacturer} {flight.aircraft?.model}
                </div>
                {isReturnPhase && (
                    <div className="text-xs text-green-600 font-semibold mt-2">
                        Chọn chuyến chiều về
                    </div>
                )}
            </div>

            {/* Right: Giá và nút chọn */}
            <div className="text-right w-[30%]">
                <p className="text-lg font-semibold text-orange-500">
                    {fare?.price?.toLocaleString('vi-VN')} VND
                </p>
                <p className="text-sm text-gray-400">/ khách</p>
                <Button
                    size="sm"
                    disabled={isSelected}
                    className={`w-full mt-2 cursor-pointer select-none ${
                        isSelected
                            ? 'bg-gray-300 text-white cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                    onClick={() => onSelect(flight)}
                >
                    {isSelected ? 'Đã chọn' : 'Chọn'}
                </Button>
                <div className="flex flex-wrap justify-end gap-1 text-xs mt-2 text-gray-500">
                    {flight.fareOptions?.map((opt: any) => (
                        <span
                            key={opt.class}
                            className="flex items-center gap-1"
                        >
                            <Ticket className="h-3 w-3 text-blue-400" />
                            {opt.class}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
