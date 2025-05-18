import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import flightApiRequest from '@/app/apiRequests/flight';
import {
    CreateFlightReqType,
    UpdateFlightReqType,
    PaginationParamsType,
} from '@/schemaValidations/flights.schema';

// Lấy danh sách chuyến bay có phân trang (query)
export const useFlights = (query?: PaginationParamsType) => {
    return useQuery({
        queryKey: ['flights', query],
        queryFn: () => flightApiRequest.getFlights(query),
    });
};

// Lấy chi tiết chuyến bay theo ID
export const useFlightDetail = (flightId?: string) => {
    return useQuery({
        queryKey: ['flight-detail', flightId],
        queryFn: () =>
            flightId
                ? flightApiRequest.getFlightDetail(flightId)
                : Promise.reject('No flightId'),
        enabled: !!flightId,
    });
};

// Tạo chuyến bay mới
export const useCreateFlightMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateFlightReqType) =>
            flightApiRequest.createFlight(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flights'] });
        },
    });
};

// Cập nhật chuyến bay
export const useUpdateFlightMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            flightId,
            body,
        }: {
            flightId: string;
            body: UpdateFlightReqType;
        }) => flightApiRequest.updateFlight(flightId, body),
        onSuccess: (_, { flightId }) => {
            queryClient.invalidateQueries({
                queryKey: ['flight-detail', flightId],
            });
            queryClient.invalidateQueries({ queryKey: ['flights'] });
        },
    });
};

// Xoá chuyến bay
export const useDeleteFlightMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (flightId: string) =>
            flightApiRequest.deleteFlight(flightId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flights'] });
        },
    });
};
