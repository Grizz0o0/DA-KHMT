import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    CreateAirlineReqType,
    CreateAirlineResType,
    UpdateAirlineReqType,
    UpdateAirlineResType,
    DeleteAirlineResType,
    GetAirlineByXResType,
    GetListAirlineResType,
    PaginationParamsType,
} from '@/schemaValidations/airlines.schema';

const airlineApiRequest = {
    getAirlines: (query?: PaginationParamsType) =>
        http.get<GetListAirlineResType>(
            `/v1/api/airlines?${query ? toQueryString(query) : ''}`
        ),

    getAirlineDetail: (airlineId: string) =>
        http.get<GetAirlineByXResType>(`/v1/api/airlines/${airlineId}`),

    createAirline: (body: CreateAirlineReqType) =>
        http.post<CreateAirlineResType>('/v1/api/airlines', body),

    updateAirline: (airlineId: string, body: UpdateAirlineReqType) =>
        http.patch<UpdateAirlineResType>(`/v1/api/airlines/${airlineId}`, body),

    deleteAirline: (airlineId: string) =>
        http.delete<DeleteAirlineResType>(`/v1/api/airlines/${airlineId}`, {}),
};

export default airlineApiRequest;
