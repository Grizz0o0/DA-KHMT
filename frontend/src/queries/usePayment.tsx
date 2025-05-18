// src/queries/usePayment.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import paymentApiRequest from '@/app/apiRequests/payment';
import {
    PaymentMoMoSchemaType,
    PaginationParamsType,
    UpdatePaymentStatusReqType,
} from '@/schemaValidations/payments.schema';

export const usePayments = (query?: PaginationParamsType) =>
    useQuery({
        refetchOnMount: true,
        queryKey: ['payments', query],
        queryFn: () => paymentApiRequest.getPayments(query),
    });

export const usePaymentDetail = (paymentId?: string) =>
    useQuery({
        queryKey: ['payment-detail', paymentId],
        queryFn: () =>
            paymentId
                ? paymentApiRequest.getPaymentById(paymentId)
                : Promise.reject('No paymentId'),
        enabled: !!paymentId,
    });

export const usePaymentWithMomoMutation = () =>
    useMutation({
        mutationFn: (body: PaymentMoMoSchemaType) =>
            paymentApiRequest.paymentWithMomo(body),
    });

export const useUpdatePaymentStatusMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            paymentId,
            body,
        }: {
            paymentId: string;
            body: UpdatePaymentStatusReqType;
        }) => paymentApiRequest.updatePaymentStatus(paymentId, body),
        onSuccess: (_, { paymentId }) => {
            queryClient.invalidateQueries({
                queryKey: ['payment-detail', paymentId],
            });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });
};
