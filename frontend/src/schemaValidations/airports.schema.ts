import { z } from 'zod';

export const objectIdStringSchema = z
    .string()
    .length(24, 'ObjectId phải dài 24 ký tự')
    .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

// Phân trang dùng chung
export const PaginationParams = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    order: z.enum(['asc', 'desc']).default('asc').optional(),
    sortBy: z
        .enum(['name', 'code', 'address', 'city'])
        .default('name')
        .optional(),
});
export type PaginationParamsType = z.infer<typeof PaginationParams>;

const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
});

export const CreateAirportReqSchema = z.object({
    name: z.string().min(1, 'Tên sân bay không được để trống'),
    code: z.string().min(1, 'Mã sân bay không được để trống'),
    city: z.string().min(1, 'Thành phố không được để trống'),
    address: z.string().trim().optional(),
    country: z.string().trim().optional(),
});
export type CreateAirportReqType = z.infer<typeof CreateAirportReqSchema>;

export const UpdateAirportReqSchema = CreateAirportReqSchema.partial();
export type UpdateAirportReqType = z.infer<typeof UpdateAirportReqSchema>;

export const AirportDetailSchema = z.object({
    _id: objectIdStringSchema,
    name: z.string(),
    code: z.string(),
    city: z.string(),
    country: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});
export type AirportDetailType = z.infer<typeof AirportDetailSchema>;

const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string(),
});

export const GetListAirportResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airports: z.array(AirportDetailSchema),
    }),
    pagination: PaginationSchema,
});
export type GetListAirportResType = z.infer<typeof GetListAirportResSchema>;

export const GetAirportByXResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airport: AirportDetailSchema,
    }),
});
export type GetAirportByXResType = z.infer<typeof GetAirportByXResSchema>;

export const CreateAirportResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airport: z.object({
            acknowledged: z.boolean(),
            insertedId: objectIdStringSchema,
        }),
    }),
});
export type CreateAirportResType = z.infer<typeof CreateAirportResSchema>;

export const UpdateAirportResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airport: AirportDetailSchema,
    }),
});
export type UpdateAirportResType = z.infer<typeof UpdateAirportResSchema>;

export const DeleteAirportResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airport: AirportDetailSchema,
    }),
});
export type DeleteAirportResType = z.infer<typeof DeleteAirportResSchema>;
