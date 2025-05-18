import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@/constants/payments';

// ======== COMMON ========
export const objectIdStringSchema = z
    .string()
    .length(24, 'ObjectId phải dài 24 ký tự')
    .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

// ======== PAGINATION ========

export const PaginationParams = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    order: z.enum(['asc', 'desc']).default('asc').optional(),
    sortBy: z
        .enum(['departureTime', 'arrivalTime', 'price', 'availableSeats'])
        .default('departureTime')
        .optional(),
});
export type PaginationParamsType = z.infer<typeof PaginationParams>;

export const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
});

// ======== REQUEST ========

export const PaymentMoMoSchema = z.object({
    bookingId: objectIdStringSchema,
    userId: objectIdStringSchema,
    amount: z
        .number()
        .min(1000, 'Số tiền phải lớn hơn 1000')
        .max(20000000, 'Số tiền phải nhỏ hơn 20000000'),
    orderId: z.string().min(1, 'Mã đơn hàng không được để trống'),
    orderInfo: z
        .string()
        .min(1, 'Thông tin đơn hàng không được để trống')
        .max(100, 'Thông tin đơn hàng không được vượt quá 100 ký tự'),
    lang: z.enum(['vi', 'en']).default('vi'),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.MOMO),
});
export type PaymentMoMoSchemaType = z.infer<typeof PaymentMoMoSchema>;

export const momoCallbackSchema = z.object({
    partnerCode: z.string(),
    orderId: z.string(),
    requestId: z.string(),
    amount: z.number(),
    orderInfo: z.string(),
    orderType: z.string(),
    transId: z.number(),
    resultCode: z.number(),
    message: z.string(),
    payType: z.string(),
    responseTime: z.number(),
    extraData: z.string(),
    signature: z.string(),
});
export type MomoCallbackSchemaType = z.infer<typeof momoCallbackSchema>;

export const UpdatePaymentStatusReqType = z.object({
    status: z.nativeEnum(PaymentStatus),
});
export type UpdatePaymentStatusReqType = z.infer<
    typeof UpdatePaymentStatusReqType
>;

// ======== RESPONSE ========

export const PaymentDetailSchema = z.object({
    _id: objectIdStringSchema,
    bookingId: objectIdStringSchema,
    userId: objectIdStringSchema,
    orderId: z.string(),
    amount: z.number(),
    paymentMethod: z
        .nativeEnum(PaymentMethod)
        .default(PaymentMethod.MOMO)
        .optional(),
    status: z
        .nativeEnum(PaymentStatus)
        .default(PaymentStatus.PENDING)
        .optional(),
    paymentDate: z.string(),
    transactionId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type PaymentDetailType = z.infer<typeof PaymentDetailSchema>;

export const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string().optional(),
});

export const GetListPaymentResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        payments: z.array(
            z.object({
                payments: z.object({
                    _id: objectIdStringSchema,
                    bookingId: objectIdStringSchema,
                    userId: objectIdStringSchema,
                    orderId: z.string(),
                    amount: z.number(),
                    paymentMethod: z.nativeEnum(PaymentMethod),
                    status: z.nativeEnum(PaymentStatus),
                    transactionId: z.string(),
                }),
            })
        ),
        pagination: PaginationSchema,
    }),
});
export type GetListPaymentResType = z.infer<typeof GetListPaymentResSchema>;

export const UpdatePaymentResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        payment: PaymentDetailSchema,
    }),
});
export type UpdatePaymentResType = z.infer<typeof UpdatePaymentResSchema>;

export const GetPaymentByIdResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        payment: PaymentDetailSchema,
    }),
});
export type GetPaymentByIdResType = z.infer<typeof GetPaymentByIdResSchema>;

export const PaymentWithMomoResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        partnerCode: z.nativeEnum(PaymentMethod).default(PaymentMethod.MOMO),
        orderId: z.string(),
        requestId: z.string(),
        amount: z.number(),
        responseTime: z.number(),
        message: z.string(),
        resultCode: z.number(),
        payUrl: z.string(),
        shortLink: z.string(),
    }),
});
export type PaymentWithMomoResType = z.infer<typeof PaymentWithMomoResSchema>;
