import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    CreateFlightReqType,
    CreateFlightResType,
    DeleteFlightResType,
    GetFlightByXResType,
    GetListFlightResType,
    UpdateFlightReqType,
    UpdateFlightResType,
    PaginationParamsType,
    GetFlightByIdResType,
} from '@/schemaValidations/flights.schema';

const flightApiRequest = {
    getFlights: (query?: PaginationParamsType) =>
        http.get<GetListFlightResType>(
            `/v1/api/flights?${query ? toQueryString(query) : ''}`
        ),

    getFlightDetail: (flightId: string) =>
        http.get<GetFlightByIdResType>(`/v1/api/flights/${flightId}`),

    createFlight: (body: CreateFlightReqType) =>
        http.post<CreateFlightResType>('/v1/api/flights', body),

    updateFlight: (flightId: string, body: UpdateFlightReqType) =>
        http.patch<UpdateFlightResType>(`/v1/api/flights/${flightId}`, body),

    deleteFlight: (flightId: string) =>
        http.delete<DeleteFlightResType>(`/v1/api/flights/${flightId}`, {}),
};

export default flightApiRequest;
