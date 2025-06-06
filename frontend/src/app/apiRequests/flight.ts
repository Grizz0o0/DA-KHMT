import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    CreateFlightReqType,
    CreateFlightResType,
    DeleteFlightResType,
    GetListFlightResType,
    UpdateFlightReqType,
    UpdateFlightResType,
    PaginationParamsType,
    GetFlightByIdResType,
    SearchFlightResType,
    SearchFlightReqType,
    FilterFlightReqType,
    FilterFlightResType,
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

    searchFlights: (query: SearchFlightReqType) =>
        http.get<SearchFlightResType>(
            `/v1/api/flights/search?${query ? toQueryString(query) : ''}`
        ),

    filterFlights: (query: FilterFlightReqType) =>
        http.get<FilterFlightResType>(
            `/v1/api/flights/filter?${query ? toQueryString(query) : ''}`
        ),
};

export default flightApiRequest;
