import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    CreateAircraftReqType,
    CreateAircraftResType,
    UpdateAircraftReqType,
    UpdateAircraftResType,
    DeleteAircraftResType,
    GetListAircraftResType,
    PaginationParamsType,
    GetAircraftByIdResType,
} from '@/schemaValidations/aircrafts.schema';

const aircraftApiRequest = {
    getAircrafts: (query?: PaginationParamsType) =>
        http.get<GetListAircraftResType>(
            `/v1/api/aircrafts?${query ? toQueryString(query) : ''}`
        ),

    getAircraftDetail: (aircraftId: string) =>
        http.get<GetAircraftByIdResType>(`/v1/api/aircrafts/${aircraftId}`),

    getAircraftByAirlineId: (airlineId: string, query?: PaginationParamsType) =>
        http.get<GetListAircraftResType>(
            `/v1/api/aircrafts/airline?airlineId=${airlineId}&${
                query ? toQueryString(query) : ''
            }`
        ),

    createAircraft: (body: CreateAircraftReqType) =>
        http.post<CreateAircraftResType>('/v1/api/aircrafts', body),

    updateAircraft: (aircraftId: string, body: UpdateAircraftReqType) =>
        http.patch<UpdateAircraftResType>(
            `/v1/api/aircrafts/${aircraftId}`,
            body
        ),

    deleteAircraft: (aircraftId: string) =>
        http.delete<DeleteAircraftResType>(
            `/v1/api/aircrafts/${aircraftId}`,
            {}
        ),
};

export default aircraftApiRequest;
