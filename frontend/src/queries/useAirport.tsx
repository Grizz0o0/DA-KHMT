import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import airportApiRequest from '@/app/apiRequests/airport';
import {
    CreateAirportReqType,
    UpdateAirportReqType,
    PaginationParamsType,
} from '@/schemaValidations/airports.schema';

export const useAirports = (query?: PaginationParamsType) =>
    useQuery({
        queryKey: ['airports', query],
        queryFn: () => airportApiRequest.getAirports(query),
    });

export const useAirportDetail = (airportId?: string) =>
    useQuery({
        queryKey: ['airport-detail', airportId],
        queryFn: () =>
            airportId
                ? airportApiRequest.getAirportDetail(airportId)
                : Promise.reject('No airportId'),
        enabled: !!airportId,
    });

export const useCreateAirportMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateAirportReqType) =>
            airportApiRequest.createAirport(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['airports'] });
        },
    });
};

export const useUpdateAirportMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            airportId,
            body,
        }: {
            airportId: string;
            body: UpdateAirportReqType;
        }) => airportApiRequest.updateAirport(airportId, body),
        onSuccess: (_, { airportId }) => {
            queryClient.invalidateQueries({
                queryKey: ['airport-detail', airportId],
            });
            queryClient.invalidateQueries({ queryKey: ['airports'] });
        },
    });
};

export const useDeleteAirportMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (airportId: string) =>
            airportApiRequest.deleteAirport(airportId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['airports'] });
        },
    });
};
