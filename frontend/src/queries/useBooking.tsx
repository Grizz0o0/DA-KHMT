// src/queries/useBooking.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookingApiRequest from '@/app/apiRequests/booking';
import {
    CreateBookingTypeBody,
    UpdateBookingTypeBody,
    PaginationParamsType,
} from '@/schemaValidations/bookings.schema';

export const useBookings = (query?: PaginationParamsType) =>
    useQuery({
        queryKey: ['bookings', query],
        queryFn: () => bookingApiRequest.getBookings(query),
    });

export const useBookingDetail = (bookingId?: string) =>
    useQuery({
        queryKey: ['booking-detail', bookingId],
        queryFn: () =>
            bookingId
                ? bookingApiRequest.getBookingDetail(bookingId)
                : Promise.reject('No bookingId'),
        enabled: !!bookingId,
    });

export const useCreateBookingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateBookingTypeBody) =>
            bookingApiRequest.createBooking(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
};

export const useUpdateBookingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            bookingId,
            body,
        }: {
            bookingId: string;
            body: UpdateBookingTypeBody;
        }) => bookingApiRequest.updateBooking(bookingId, body),
        onSuccess: (_, { bookingId }) => {
            queryClient.invalidateQueries({
                queryKey: ['booking-detail', bookingId],
            });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
};

export const useDeleteBookingMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bookingId: string) =>
            bookingApiRequest.deleteBooking(bookingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
};

export const useBookingStats = () =>
    useQuery({
        queryKey: ['booking-stats'],
        queryFn: () => bookingApiRequest.getBookingStats(),
    });
