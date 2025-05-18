// src/queries/usePromoCode.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import promoCodeApiRequest from '@/app/apiRequests/promoCode';
import {
    CreatePromoCodeReqType,
    PaginationParamsType,
    UpdatePromoCodeReqType,
} from '@/schemaValidations/promoCodes.schema';

// Lấy danh sách mã giảm giá
export const usePromoCodes = (query?: PaginationParamsType) =>
    useQuery({
        queryKey: ['promo-codes', query],
        queryFn: () => promoCodeApiRequest.getPromoCodes(query),
        refetchOnMount: true,
    });

// Validate mã giảm giá
export const useValidatePromoCodeMutation = () =>
    useMutation({
        mutationFn: (code: string) =>
            promoCodeApiRequest.validatePromoCode(code),
    });

// Sử dụng mã giảm giá
export const useUsePromoCodeMutation = () =>
    useMutation({
        mutationFn: (code: string) => promoCodeApiRequest.usePromoCode(code),
    });

// Lấy chi tiết mã giảm giá theo ID
export const usePromoCodeDetail = (id?: string) =>
    useQuery({
        queryKey: ['promo-code', id],
        queryFn: () =>
            id
                ? promoCodeApiRequest.getPromoCodeById(id)
                : Promise.reject('Missing id'),
        enabled: !!id,
    });

// Lấy mã giảm giá theo code
export const usePromoCodeByCode = (code?: string) =>
    useQuery({
        queryKey: ['promo-code-by-code', code],
        queryFn: () =>
            code
                ? promoCodeApiRequest.getPromoCodeByCode(code)
                : Promise.reject('Missing code'),
        enabled: !!code,
    });

// Tạo mã giảm giá
export const useCreatePromoCodeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreatePromoCodeReqType) =>
            promoCodeApiRequest.createPromoCode(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
        },
    });
};

// Cập nhật mã giảm giá
export const useUpdatePromoCodeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            body,
        }: {
            id: string;
            body: UpdatePromoCodeReqType;
        }) => promoCodeApiRequest.updatePromoCode(id, body),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['promo-code', id] });
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
        },
    });
};

// Xoá mã giảm giá (isActive: false)
export const useDeletePromoCodeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => promoCodeApiRequest.deletePromoCode(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
        },
    });
};

// Kích hoạt lại mã giảm giá (isActive: true)
export const useActivatePromoCodeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => promoCodeApiRequest.isActivePromoCode(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['promo-code', id] });
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
        },
    });
};
