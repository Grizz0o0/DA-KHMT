// src/schemas/frontend/flights.schema.ts
import { AircraftClass } from '@/constants/aircrafts';
import { seatConfigurationSchema } from '@/schemaValidations/aircrafts.schema';
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
        .enum(['departureTime', 'arrivalTime', 'price', 'availableSeats'])
        .default('departureTime')
        .optional(),
});
export type PaginationParamsType = z.infer<typeof PaginationParams>;

export const FareOptionSchema = z.object({
    class: z.nativeEnum(AircraftClass),
    price: z.coerce.number().nonnegative('Giá vé phải lớn hơn hoặc bằng 0'),
    availableSeats: z.coerce
        .number()
        .int('Số ghế phải là số nguyên')
        .nonnegative('Số ghế phải >= 0'),
    perks: z.array(z.string()),
});

export const FareOptionFilterSchema = z.object({
    class: z.nativeEnum(AircraftClass).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    minAvailableSeats: z.coerce.number().int().nonnegative().optional(),
    maxAvailableSeats: z.coerce.number().int().nonnegative().optional(),
});

const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
});

export const CreateFlightReqSchema = z.object({
    flightNumber: z
        .string()
        .trim()
        .min(1, 'Số hiệu chuyến bay không được để trống'),
    airlineId: objectIdStringSchema,
    aircraftId: objectIdStringSchema,
    departureAirportId: objectIdStringSchema,
    arrivalAirportId: objectIdStringSchema,
    departureTime: z.coerce.date({
        required_error: 'Chưa chọn thời gian khởi hành',
    }),
    arrivalTime: z.coerce.date({ required_error: 'Chưa chọn thời gian đến' }),
    duration: z.coerce.number().min(1, 'Thời gian bay phải lớn hơn 0'),
    fareOptions: z.array(FareOptionSchema),
});
export type CreateFlightReqType = z.infer<typeof CreateFlightReqSchema>;

export const UpdateFlightReqSchema = CreateFlightReqSchema.partial();
export type UpdateFlightReqType = z.infer<typeof UpdateFlightReqSchema>;

export const SearchFlightReqSchema = z
    .object({
        departureAirport: z
            .string()
            .trim()
            .min(1, 'Điểm đi là bắt buộc')
            .optional(),
        arrivalAirport: z
            .string()
            .trim()
            .min(1, 'Điểm đến là bắt buộc')
            .optional(),
        departureTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Ngày khởi hành là bắt buộc',
        }),
        arrivalTime: z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), {
                message: 'Ngày đến không hợp lệ',
            }),
        passengerCount: z.coerce.number().int().min(1).default(1),
    })
    .merge(PaginationParams);
export type SearchFlightReqType = z.infer<typeof SearchFlightReqSchema>;

export const FilterFlightReqSchema = z
    .object({
        flightNumber: z.string().optional(),
        airlineId: objectIdStringSchema.optional(),
        airlineIds: z.array(z.string()).optional(),
        aircraftId: objectIdStringSchema.optional(),

        departureAirportCode: z.string().optional(),
        arrivalAirportCode: z.string().optional(),

        departureTime: z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), {
                message: 'Ngày khởi hành không hợp lệ',
            }),

        returnTime: z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), {
                message: 'Ngày về không hợp lệ',
            }),

        type: z.enum(['mot-chieu', 'khu-hoi']).optional(),

        duration: z.number().positive().optional(),
        passengerCount: z.coerce.number().int().min(1).default(1),
    })
    .merge(PaginationParams)
    .merge(FareOptionFilterSchema);

export type FilterFlightReqType = z.infer<typeof FilterFlightReqSchema>;

// ========== RESPONSE SCHEMAS ==========

export const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string(),
});

export const FlightDetailSchema = z.object({
    _id: z.string(),
    flightNumber: z.string(),
    airlineId: z.string(),
    aircraftId: z.string(),
    departureAirportId: z.string(),
    arrivalAirportId: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    duration: z.number(),
    fareOptions: z.array(FareOptionSchema),
    isActive: z.boolean(),
});
export type FlightDetailType = z.infer<typeof FlightDetailSchema>;

export const FlightPopulatedSchema = z.object({
    _id: z.string(),
    flightNumber: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    duration: z.number(),
    isActive: z.boolean(),
    fareOptions: z.array(FareOptionSchema),
    airline: z.object({
        _id: z.string(),
        name: z.string(),
        code: z.string(),
        logo: z.string(),
    }),

    aircraft: z.object({
        _id: z.string(),
        model: z.string(),
        manufacturer: z.string(),
        aircraftCode: z.string(),
        seatConfiguration: seatConfigurationSchema,
        capacity: z.number(),
        status: z.enum(['active', 'inactive']),
    }),

    departureAirport: z.object({
        _id: z.string(),
        name: z.string(),
        code: z.string(),
        city: z.string(),
    }),

    arrivalAirport: z.object({
        _id: z.string(),
        name: z.string(),
        code: z.string(),
        city: z.string(),
    }),
});
export type FlightPopulatedType = z.infer<typeof FlightPopulatedSchema>;

export const GetListFlightResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        flights: z.array(FlightPopulatedSchema),
        pagination: PaginationSchema,
    }),
});
export type GetListFlightResType = z.infer<typeof GetListFlightResSchema>;

export const GetFlightByIdResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        flight: FlightDetailSchema,
    }),
});
export type GetFlightByIdResType = z.infer<typeof GetFlightByIdResSchema>;

export const GetFlightByXResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        flight: z.array(FlightDetailSchema),
    }),
});
export type GetFlightByXResType = z.infer<typeof GetFlightByXResSchema>;

export const CreateFlightResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        flight: z.object({
            acknowledged: z.boolean(),
            insertedId: z.string(),
        }),
    }),
    timestamp: z.string(),
});
export type CreateFlightResType = z.infer<typeof CreateFlightResSchema>;

export const UpdateFlightResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        flight: FlightDetailSchema,
    }),
});
export type UpdateFlightResType = z.infer<typeof UpdateFlightResSchema>;

export const DeleteFlightResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        flight: FlightDetailSchema,
    }),
});
export type DeleteFlightResType = z.infer<typeof DeleteFlightResSchema>;

export const SearchFlightResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        flights: z.array(FlightPopulatedSchema),
        pagination: PaginationSchema,
    }),
});
export type SearchFlightResType = z.infer<typeof SearchFlightResSchema>;

export const FilterFlightResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        flights: z.array(FlightPopulatedSchema),
        pagination: PaginationSchema,
    }),
});
export type FilterFlightResType = z.infer<typeof FilterFlightResSchema>;
