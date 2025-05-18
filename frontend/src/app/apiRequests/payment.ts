import http from '@/lib/http';
import { toQueryString } from '@/lib/utils';
import {
    GetListPaymentResType,
    GetPaymentByIdResType,
    PaginationParamsType,
    PaymentMoMoSchemaType,
    PaymentWithMomoResType,
    UpdatePaymentResType,
    UpdatePaymentStatusReqType,
} from '@/schemaValidations/payments.schema';

const paymentApiRequest = {
    // Tạo thanh toán MoMo
    paymentWithMomo: (data: PaymentMoMoSchemaType) =>
        http.post<PaymentWithMomoResType>('/v1/api/payments/momo', data),

    // Lấy danh sách thanh toán (dành cho admin)
    getPayments: (query?: PaginationParamsType) =>
        http.get<GetListPaymentResType>(
            `/v1/api/payments?${query ? toQueryString(query) : ''}`
        ),

    // Lấy chi tiết thanh toán theo ID
    getPaymentById: (paymentId: string) =>
        http.get<GetPaymentByIdResType>(`/v1/api/payments/${paymentId}`),

    // Cập nhật trạng thái thanh toán (dành cho admin)
    updatePaymentStatus: (
        paymentId: string,
        data: UpdatePaymentStatusReqType
    ) =>
        http.patch<UpdatePaymentResType>(
            `/v1/api/payments/${paymentId}/status`,
            data
        ),
};

export default paymentApiRequest;
