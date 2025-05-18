import { z } from 'zod';

export const objectIdStringSchema = z
    .string()
    .length(24, 'ObjectId phải dài 24 ký tự')
    .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

// Phân trang dùng chung
export const PaginationParams = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    order: z.enum(['asc', 'desc']).default('asc'),
    sortBy: z
        .enum(['departureTime', 'arrivalTime', 'price', 'availableSeats'])
        .default('departureTime'),
});
export type PaginationParamsType = z.infer<typeof PaginationParams>;

export const CreateAirlineReqSchema = z.object({
    name: z.string().min(1, 'Tên hãng không được để trống'),
    code: z.string().min(1, 'Mã hãng không được để trống'),
    logo: z.string().trim().optional(),
    description: z.string().trim().optional(),
});
export type CreateAirlineReqType = z.infer<typeof CreateAirlineReqSchema>;

export const UpdateAirlineReqSchema = CreateAirlineReqSchema.partial();
export type UpdateAirlineReqType = z.infer<typeof UpdateAirlineReqSchema>;

export const AirlineDetailSchema = z.object({
    _id: objectIdStringSchema,
    name: z.string(),
    code: z.string(),
    logo: z.string().trim().optional(),
    description: z.string().trim().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});
export type AirlineDetailType = z.infer<typeof AirlineDetailSchema>;

const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string(),
});

export const GetListAirlineResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airlines: z.array(AirlineDetailSchema),
    }),
});
export type GetListAirlineResType = z.infer<typeof GetListAirlineResSchema>;

export const GetAirlineByXResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airline: AirlineDetailSchema,
    }),
});
export type GetAirlineByXResType = z.infer<typeof GetAirlineByXResSchema>;

export const CreateAirlineResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airline: z.object({
            acknowledged: z.boolean(),
            insertedId: objectIdStringSchema,
        }),
    }),
});
export type CreateAirlineResType = z.infer<typeof CreateAirlineResSchema>;

export const UpdateAirlineResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airline: AirlineDetailSchema,
    }),
});
export type UpdateAirlineResType = z.infer<typeof UpdateAirlineResSchema>;

export const DeleteAirlineResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        airline: AirlineDetailSchema,
    }),
});
export type DeleteAirlineResType = z.infer<typeof DeleteAirlineResSchema>;
