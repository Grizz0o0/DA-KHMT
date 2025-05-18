import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import airlineApiRequest from '@/app/apiRequests/airline';
import {
    CreateAirlineReqType,
    UpdateAirlineReqType,
    PaginationParamsType,
} from '@/schemaValidations/airlines.schema';

export const useAirlines = (query?: PaginationParamsType) =>
    useQuery({
        refetchOnMount: true,
        queryKey: ['airlines', query],
        queryFn: () => airlineApiRequest.getAirlines(query),
    });

export const useAirlineDetail = (airlineId?: string) =>
    useQuery({
        queryKey: ['airline-detail', airlineId],
        queryFn: () =>
            airlineId
                ? airlineApiRequest.getAirlineDetail(airlineId)
                : Promise.reject('No airlineId'),
        enabled: !!airlineId,
    });

export const useCreateAirlineMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateAirlineReqType) =>
            airlineApiRequest.createAirline(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['airlines'] });
        },
    });
};

export const useUpdateAirlineMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            airlineId,
            body,
        }: {
            airlineId: string;
            body: UpdateAirlineReqType;
        }) => airlineApiRequest.updateAirline(airlineId, body),
        onSuccess: (_, { airlineId }) => {
            queryClient.invalidateQueries({
                queryKey: ['airline-detail', airlineId],
            });
            queryClient.invalidateQueries({ queryKey: ['airlines'] });
        },
    });
};

export const useDeleteAirlineMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (airlineId: string) =>
            airlineApiRequest.deleteAirline(airlineId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['airlines'] });
        },
    });
};
