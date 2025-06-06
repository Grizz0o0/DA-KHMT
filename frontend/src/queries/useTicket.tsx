// src/queries/useTicket.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ticketApiRequest from '@/app/apiRequests/ticket';
import {
    CreateTicketTypeBody,
    CreateMultipleTicketsTypeBody,
    PaginationParamsType,
    UpdateTicketTypeBody,
} from '@/schemaValidations/tickets.schema';
import { TicketStatus } from '@/constants/tickets';

export const useTickets = (query?: PaginationParamsType) =>
    useQuery({
        refetchOnMount: true,
        queryKey: ['tickets', query],
        queryFn: () => ticketApiRequest.getTickets(query),
    });

export const useTicketDetail = (ticketId?: string) =>
    useQuery({
        queryKey: ['ticket-detail', ticketId],
        queryFn: () =>
            ticketId
                ? ticketApiRequest.getTicketById(ticketId)
                : Promise.reject('No ticketId'),
        enabled: !!ticketId,
    });

export const useTicketByBooking = (
    bookingId?: string,
    query?: PaginationParamsType
) =>
    useQuery({
        queryKey: ['ticket-by-booking', bookingId, query],
        queryFn: () =>
            bookingId
                ? ticketApiRequest.getTicketsByBookingId(bookingId, query)
                : Promise.reject('No bookingId'),
        enabled: !!bookingId,
    });

export const useCreateTicketMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTicketTypeBody) =>
            ticketApiRequest.createTicket(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

export const useCreateMultipleTicketsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMultipleTicketsTypeBody) =>
            ticketApiRequest.createMultipleTickets(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

export const useUpdateTicketMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            ticketId,
            body,
        }: {
            ticketId: string;
            body: UpdateTicketTypeBody;
        }) => {
            const updatedBody = {
                ...body,
                status: body.status || TicketStatus.Unused,
            };
            return ticketApiRequest.updateTicket(ticketId, updatedBody);
        },
        onSuccess: (_, { ticketId }) => {
            queryClient.invalidateQueries({
                queryKey: ['ticket-detail', ticketId],
            });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

export const useDeleteTicketMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ticketId: string) =>
            ticketApiRequest.deleteTicket(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

export const useTicketStats = (flightId?: string) =>
    useQuery({
        queryKey: ['ticket-stats', flightId],
        queryFn: () =>
            flightId
                ? ticketApiRequest.getTicketStats(flightId)
                : Promise.reject('No flightId'),
        enabled: !!flightId,
    });

export const useAvailableSeats = (flightId?: string) =>
    useQuery({
        queryKey: ['available-seats', flightId],
        queryFn: () =>
            flightId
                ? ticketApiRequest.getAvailableSeats(flightId)
                : Promise.reject('No flightId'),
        enabled: !!flightId,
    });

export const useBookedSeats = (flightId?: string) =>
    useQuery({
        queryKey: ['booked-seats', flightId],
        queryFn: () =>
            flightId
                ? ticketApiRequest.getBookedSeats(flightId)
                : Promise.reject('No flightId'),
        enabled: !!flightId,
    });

export const useCanCancelTicket = (ticketId?: string) =>
    useQuery({
        queryKey: ['can-cancel-ticket', ticketId],
        queryFn: () =>
            ticketId
                ? ticketApiRequest.canCancelTicket(ticketId)
                : Promise.reject('No ticketId'),
        enabled: !!ticketId,
    });
