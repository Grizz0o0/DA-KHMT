// src/schemas/frontend/flights.schema.ts
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
    price: z.coerce.number().min(0, 'Giá vé phải là số'),
    availableSeats: z.coerce.number().min(1, 'Số ghế phải là số dương'),
});
export type CreateFlightReqType = z.infer<typeof CreateFlightReqSchema>;

export const UpdateFlightReqSchema = CreateFlightReqSchema.partial();
export type UpdateFlightReqType = z.infer<typeof UpdateFlightReqSchema>;

export const SearchFlightReqSchema = z
    .object({
        departureAirport: z.string().trim().min(1, 'Điểm đi là bắt buộc'),
        arrivalAirport: z.string().trim().min(1, 'Điểm đến là bắt buộc'),
        departureTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Ngày khởi hành là bắt buộc',
        }),
        arrivalTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Ngày đến là bắt buộc',
        }),
        passengerCount: z.coerce.number().int().min(1).default(1),
    })
    .merge(PaginationSchema);
export type SearchFlightReqType = z.infer<typeof SearchFlightReqSchema>;

export const FilterFlightReqSchema = z
    .object({
        flightNumber: z.string().optional(),
        airlineId: objectIdStringSchema.optional(),
        aircraftId: objectIdStringSchema.optional(),
        departureAirportId: objectIdStringSchema.optional(),
        arrivalAirportId: objectIdStringSchema.optional(),
        departureTime: z.string().optional(),
        arrivalTime: z.string().optional(),
        duration: z.number().positive().optional(),
        price: z.number().nonnegative().optional(),
        availableSeats: z.number().int().nonnegative().optional(),
    })
    .merge(PaginationSchema);
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
    price: z.number(),
    availableSeats: z.number(),
    isActive: z.boolean(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});
export type FlightDetailType = z.infer<typeof FlightDetailSchema>;

export const GetListFlightResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        flights: z.array(FlightDetailSchema),
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
