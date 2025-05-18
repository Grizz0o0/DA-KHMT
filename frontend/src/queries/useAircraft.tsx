import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import aircraftApiRequest from '@/app/apiRequests/aircraft';
import {
    CreateAircraftReqType,
    UpdateAircraftReqType,
    PaginationParamsType,
} from '@/schemaValidations/aircrafts.schema';

export const useAircrafts = (query?: PaginationParamsType) =>
    useQuery({
        queryKey: ['aircrafts', query],
        queryFn: () => aircraftApiRequest.getAircrafts(query),
    });

export const useAircraftByAirlineId = (
    airlineId?: string,
    query?: PaginationParamsType
) =>
    useQuery({
        queryKey: ['aircrafts', airlineId, query],
        queryFn: () =>
            aircraftApiRequest.getAircraftByAirlineId(airlineId!, query),
        enabled: !!airlineId,
    });

export const useAircraftDetail = (aircraftId?: string) =>
    useQuery({
        queryKey: ['aircraft-detail', aircraftId],
        queryFn: () =>
            aircraftId
                ? aircraftApiRequest.getAircraftDetail(aircraftId)
                : Promise.reject('No aircraftId'),
        enabled: !!aircraftId,
    });

export const useCreateAircraftMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateAircraftReqType) =>
            aircraftApiRequest.createAircraft(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aircrafts'] });
        },
    });
};

export const useUpdateAircraftMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            aircraftId,
            body,
        }: {
            aircraftId: string;
            body: UpdateAircraftReqType;
        }) => aircraftApiRequest.updateAircraft(aircraftId, body),
        onSuccess: (_, { aircraftId }) => {
            queryClient.invalidateQueries({
                queryKey: ['aircraft-detail', aircraftId],
            });
            queryClient.invalidateQueries({ queryKey: ['aircrafts'] });
        },
    });
};

export const useDeleteAircraftMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (aircraftId: string) =>
            aircraftApiRequest.deleteAircraft(aircraftId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aircrafts'] });
        },
    });
};
