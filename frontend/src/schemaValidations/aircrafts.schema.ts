import { z } from 'zod';
import { AircraftClass, AircraftStatus } from '@/constants/aircrafts';

// ======== COMMON ========

export const objectIdStringSchema = z
    .string()
    .length(24, 'ObjectId phải dài 24 ký tự')
    .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

export const SeatConfigSchema = z.object({
    rows: z.coerce.number().int().nonnegative(),
    seatsPerRow: z.coerce.number().int().nonnegative(),
});

export const seatConfigurationSchema = z.object({
    [AircraftClass.Economy]: SeatConfigSchema.optional(),
    [AircraftClass.Business]: SeatConfigSchema.optional(),
    [AircraftClass.FirstClass]: SeatConfigSchema.optional(),
});

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

export const CreateAircraftReqSchema = z.object({
    model: z.string().min(1, 'Model không được để trống'),
    manufacturer: z.string().min(1, 'Hãng sản xuất không được để trống'),
    airlineId: objectIdStringSchema,
    aircraftCode: z.string().min(1, 'Mã máy bay không được để trống'),
    seatConfiguration: seatConfigurationSchema,
});
export type CreateAircraftReqType = z.infer<typeof CreateAircraftReqSchema>;

export const UpdateAircraftReqSchema = z.object({
    model: z.string().min(1).optional(),
    manufacturer: z.string().min(1).optional(),
    aircraftCode: z.string().min(1).optional(),
    seatConfiguration: seatConfigurationSchema.optional(),
});
export type UpdateAircraftReqType = z.infer<typeof UpdateAircraftReqSchema>;

export const FilterAircraftReqSchema = PaginationParams.pick({
    page: true,
    limit: true,
    order: true,
}).extend({
    model: z.string().optional(),
    manufacturer: z.string().optional(),
    aircraftCode: z.string().optional(),
    status: z.nativeEnum(AircraftStatus).optional(),
    select: z.array(z.string()).optional(),
});
export type FilterAircraftReqType = z.infer<typeof FilterAircraftReqSchema>;

export const SearchAircraftReqSchema = z.object({
    content: z.string().min(1),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
});
export type SearchAircraftReqType = z.infer<typeof SearchAircraftReqSchema>;

// ======== RESPONSE ========

export const AircraftDetailSchema = z.object({
    _id: objectIdStringSchema,
    model: z.string(),
    manufacturer: z.string(),
    airlineId: objectIdStringSchema,
    aircraftCode: z.string(),
    seatConfiguration: seatConfigurationSchema,
    status: z.nativeEnum(AircraftStatus),
    capacity: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type AircraftDetailType = z.infer<typeof AircraftDetailSchema>;

export const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string().optional(),
});

export const CreateAircraftResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        aircraft: z.object({
            acknowledged: z.boolean(),
            insertedId: objectIdStringSchema,
        }),
    }),
});
export type CreateAircraftResType = z.infer<typeof CreateAircraftResSchema>;

export const UpdateAircraftResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        aircraft: AircraftDetailSchema,
    }),
});
export type UpdateAircraftResType = z.infer<typeof UpdateAircraftResSchema>;

export const DeleteAircraftResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        aircraft: AircraftDetailSchema,
    }),
});
export type DeleteAircraftResType = z.infer<typeof DeleteAircraftResSchema>;

export const GetListAircraftResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        aircrafts: z.array(AircraftDetailSchema),
        pagination: PaginationSchema,
    }),
});
export type GetListAircraftResType = z.infer<typeof GetListAircraftResSchema>;

export const GetAircraftByIdResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        aircraft: AircraftDetailSchema,
    }),
});
export type GetAircraftByIdResType = z.infer<typeof GetAircraftByIdResSchema>;

export const GetAircraftByXResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        aircrafts: z.array(AircraftDetailSchema),
    }),
});
export type GetAircraftByXResType = z.infer<typeof GetAircraftByXResSchema>;

export const GetAircraftByCodeResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        aircraft: AircraftDetailSchema,
    }),
});
export type GetAircraftByCodeResType = z.infer<
    typeof GetAircraftByCodeResSchema
>;

export const SearchAircraftResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        aircrafts: z.array(AircraftDetailSchema),
        pagination: PaginationSchema,
    }),
});
export type SearchAircraftResType = z.infer<typeof SearchAircraftResSchema>;

export const FilterAircraftResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        aircrafts: z.array(AircraftDetailSchema),
        pagination: PaginationSchema,
    }),
});
export type FilterAircraftResType = z.infer<typeof FilterAircraftResSchema>;
