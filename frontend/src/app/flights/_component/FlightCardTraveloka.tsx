import React from 'react';
import { FlightPopulatedType } from '@/schemaValidations/flights.schema';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Image from 'next/image';

interface FlightCardTravelokaProps {
    flight: FlightPopulatedType;
    onSelect: (flight: FlightPopulatedType) => void;
}

const FlightCardTraveloka: React.FC<FlightCardTravelokaProps> = ({
    flight,
    onSelect,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden w-full max-w-xs">
            <div className="relative">
                <Image
                    width={50}
                    height={50}
                    src="/images/flight-default.jpg"
                    alt="Flight"
                    className="w-full h-40 object-cover"
                />
                <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    MỘT CHIỀU
                </span>
            </div>
            <div className="p-4">
                <h3 className="text-gray-800 font-semibold text-lg">
                    {flight.departureAirport.name} -{' '}
                    {flight.arrivalAirport.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                    {format(new Date(flight.departureTime), 'dd/MM/yyyy')}
                </p>
                <p className="text-orange-600 font-bold text-lg">
                    {Number(flight.fareOptions[0].price).toLocaleString()} VND
                </p>
            </div>
        </div>
    );
};

export default FlightCardTraveloka;
