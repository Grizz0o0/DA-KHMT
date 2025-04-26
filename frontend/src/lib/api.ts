// lib/api.ts
const API_URL = 'http://localhost:3052/v1/api';

export const fetchAirports = async () => {
    const res = await fetch(`${API_URL}/airports?limit=200`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) throw new Error('Lỗi khi lấy danh sách sân bay');
    const data = await res.json();
    return data.metadata || [];
};

export const searchFlights = async (searchParams: {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
}) => {
    const res = await fetch(`${API_URL}/flights/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
    });
    if (!res.ok) throw new Error('Lỗi khi tìm kiếm chuyến bay');
    const data = await res.json();
    return data.metadata || [];
};

export const getFlightDetails = async (flightId: string) => {
    const res = await fetch(`${API_URL}/flights/${flightId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) throw new Error('Lỗi khi lấy thông tin chuyến bay');
    const data = await res.json();
    return data.metadata || null;
};

export const getAvailableSeats = async (flightId: string) => {
    const res = await fetch(`${API_URL}/flights/${flightId}/seats`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) throw new Error('Lỗi khi lấy thông tin ghế ngồi');
    const data = await res.json();
    return data.metadata || [];
};
