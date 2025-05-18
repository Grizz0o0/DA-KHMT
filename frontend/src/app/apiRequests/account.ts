import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    ChangePasswordReqBodyType,
    ChangePasswordResBodyType,
    GetListUserResBodyType,
    MeResBodyType,
    PaginationParamsType,
    UpdateMeReqBodyType,
    UpdateMeResBodyType,
} from '@/schemaValidations/users.schema';

const accountApiRequest = {
    me: () => http.get<MeResBodyType>('/v1/api/users/me'),

    changePassword: (body: ChangePasswordReqBodyType) =>
        http.post<ChangePasswordResBodyType>(
            '/v1/api/users/change-password',
            body
        ),

    updateMe: (body: UpdateMeReqBodyType) =>
        http.patch<UpdateMeResBodyType>('/v1/api/users', body),

    getListUser: (query?: PaginationParamsType) =>
        http.get<GetListUserResBodyType>(
            `/v1/api/users?${query ? `${toQueryString(query)}` : ''}`
        ),
};

export default accountApiRequest;
