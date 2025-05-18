// src/app/apiRequests/promoCode.ts
import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    CreatePromoCodeReqType,
    PaginationParamsType,
    PromoCodeDetailResType,
    PromoCodeListResType,
    UpdatePromoCodeReqType,
} from '@/schemaValidations/promoCodes.schema';

const promoCodeApiRequest = {
    validatePromoCode: (code: string) =>
        http.post<PromoCodeDetailResType>(
            `/v1/api/promo-codes/validate/${code}`,
            {}
        ),

    usePromoCode: (code: string) =>
        http.post<PromoCodeDetailResType>(
            `/v1/api/promo-codes/use/${code}`,
            {}
        ),

    getPromoCodes: (query?: PaginationParamsType) =>
        http.get<PromoCodeListResType>(
            `/v1/api/promo-codes?${query ? toQueryString(query) : ''}`
        ),

    createPromoCode: (body: CreatePromoCodeReqType) =>
        http.post('/v1/api/promo-codes', body),

    updatePromoCode: (id: string, body: UpdatePromoCodeReqType) =>
        http.patch<PromoCodeDetailResType>(`/v1/api/promo-codes/${id}`, body),

    deletePromoCode: (id: string) =>
        http.delete(`/v1/api/promo-codes/${id}`, {}),

    isActivePromoCode: (id: string) =>
        http.post(`/v1/api/promo-codes/activate/${id}`, {}),

    getPromoCodeById: (id: string) =>
        http.get<PromoCodeDetailResType>(`/v1/api/promo-codes/${id}`),

    getPromoCodeByCode: (code: string) =>
        http.get<PromoCodeDetailResType>(`/v1/api/promo-codes/code/${code}`),
};

export default promoCodeApiRequest;
