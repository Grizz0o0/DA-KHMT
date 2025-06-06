import {
    useQuery,
    UseQueryOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import flightApiRequest from '@/app/apiRequests/flight';
import {
    CreateFlightReqType,
    UpdateFlightReqType,
    PaginationParamsType,
    SearchFlightReqType,
    FilterFlightReqType,
} from '@/schemaValidations/flights.schema';

// Lấy danh sách chuyến bay có phân trang (query)
export const useFlights = (query?: PaginationParamsType) => {
    return useQuery({
        queryKey: ['flights', query],
        queryFn: () => flightApiRequest.getFlights(query),
    });
};

// Lấy chi tiết chuyến bay theo ID

export const useFlightDetail = (
    flightId?: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ['flight-detail', flightId],
        queryFn: () =>
            flightId
                ? flightApiRequest.getFlightDetail(flightId)
                : Promise.reject('No flightId'),
        enabled: !!flightId,
        ...options,
    });
};

export const useSearchFlights = (query?: SearchFlightReqType) => {
    return useQuery({
        queryKey: ['search-flights', query],
        queryFn: () => {
            if (!query) throw new Error('Query is required');
            return flightApiRequest.searchFlights(query);
        },
        enabled: !!query,
    });
};

export const useFilterFlights = (query?: FilterFlightReqType) => {
    return useQuery({
        queryKey: ['filter-flights', query],
        queryFn: () => {
            if (!query) throw new Error('Query is required');
            return flightApiRequest.filterFlights(query);
        },
        enabled: !!query,
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
