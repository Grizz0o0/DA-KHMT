import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    CreateAirportReqType,
    CreateAirportResType,
    UpdateAirportReqType,
    UpdateAirportResType,
    DeleteAirportResType,
    GetAirportByXResType,
    GetListAirportResType,
    PaginationParamsType,
} from '@/schemaValidations/airports.schema';

const airportApiRequest = {
    getAirports: (query?: PaginationParamsType) =>
        http.get<GetListAirportResType>(
            `/v1/api/airports?${query ? toQueryString(query) : ''}`
        ),

    getAirportDetail: (airportId: string) =>
        http.get<GetAirportByXResType>(`/v1/api/airports/${airportId}`),

    createAirport: (body: CreateAirportReqType) =>
        http.post<CreateAirportResType>('/v1/api/airports', body),

    updateAirport: (airportId: string, body: UpdateAirportReqType) =>
        http.patch<UpdateAirportResType>(`/v1/api/airports/${airportId}`, body),

    deleteAirport: (airportId: string) =>
        http.delete<DeleteAirportResType>(`/v1/api/airports/${airportId}`, {}),
};

export default airportApiRequest;
