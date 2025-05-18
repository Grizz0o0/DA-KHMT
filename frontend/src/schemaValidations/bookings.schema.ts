import { z } from 'zod';
import { BookingStatus } from '@/constants/bookings';
import { PaymentStatus } from '@/constants/payments';
import { AircraftClass } from '@/constants/aircrafts';
import { UserGender } from '@/constants/users';

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
        .enum(['status', 'totalPrice', 'bookingTime'])
        .default('bookingTime')
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

// ======== REQUEST ========
export const CreateBookingSchema = {
    body: z.object({
        userId: objectIdStringSchema,
        flightId: objectIdStringSchema,
        seatClass: z.nativeEnum(AircraftClass),
        quantity: z.coerce.number().int().min(1, 'Phải đặt ít nhất 1 vé'),
        totalPrice: z.coerce
            .number()
            .nonnegative('Tổng tiền phải lớn hơn hoặc bằng 0'),
    }),
};

export type CreateBookingTypeBody = z.infer<typeof CreateBookingSchema.body>;

export const UpdateBookingSchema = {
    params: z.object({
        bookingId: objectIdStringSchema,
    }),
    body: z.object({
        status: z.nativeEnum(BookingStatus).optional(),
        paymentStatus: z.nativeEnum(PaymentStatus).optional(),
        totalPrice: z.coerce
            .number()
            .nonnegative('Tổng tiền phải lớn hơn hoặc bằng 0')
            .optional(),
    }),
};

export type UpdateBookingTypeParams = z.infer<
    typeof UpdateBookingSchema.params
>;
export type UpdateBookingTypeBody = z.infer<typeof UpdateBookingSchema.body>;

export const DeleteBookingSchema = {
    params: z.object({
        bookingId: objectIdStringSchema,
    }),
};

export type DeleteBookingTypeParams = z.infer<
    typeof DeleteBookingSchema.params
>;

export const SearchBookingsSchema = {
    query: z
        .object({
            userId: objectIdStringSchema.optional(),
            flightId: objectIdStringSchema.optional(),
            status: z.nativeEnum(BookingStatus).optional(),
            startDate: z.coerce.date().optional(),
            endDate: z.coerce.date().optional(),
            minPrice: z.coerce.number().min(0).optional(),
            maxPrice: z.coerce.number().min(0).optional(),
            paymentStatus: z.nativeEnum(PaymentStatus).optional(),
            page: z.coerce.number().min(1).optional().default(1),
            limit: z.coerce.number().min(1).max(100).optional().default(10),
            sortBy: z
                .enum(['status', 'totalPrice', 'bookingTime'])
                .optional()
                .default('bookingTime'),
            sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
        })
        .superRefine((data, ctx) => {
            if (
                data.startDate &&
                data.endDate &&
                data.startDate > data.endDate
            ) {
                ctx.addIssue({
                    path: ['endDate'],
                    code: z.ZodIssueCode.custom,
                    message: 'endDate phải lớn hơn hoặc bằng startDate',
                });
            }

            if (
                data.minPrice &&
                data.maxPrice &&
                data.minPrice > data.maxPrice
            ) {
                ctx.addIssue({
                    path: ['maxPrice'],
                    code: z.ZodIssueCode.custom,
                    message: 'maxPrice phải lớn hơn hoặc bằng minPrice',
                });
            }
        }),
};

export type SearchBookingsTypeQuery = z.infer<
    typeof SearchBookingsSchema.query
>;

export const GetBookingByIdSchema = {
    params: z.object({
        bookingId: objectIdStringSchema,
    }),
};

export type GetBookingByIdTypeParams = z.infer<
    typeof GetBookingByIdSchema.params
>;

// ======== RESPONSE ========
export const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string(),
});

export const BookingDetailSchema = z.object({
    _id: objectIdStringSchema,
    userId: objectIdStringSchema,
    flightId: objectIdStringSchema,
    seatClass: z.nativeEnum(AircraftClass),
    bookingTime: z.string(),
    quantity: z.number(),
    totalPrice: z.number(),
    status: z.nativeEnum(BookingStatus),
    paymentStatus: z.nativeEnum(PaymentStatus),
});
export type BookingDetailType = z.infer<typeof BookingDetailSchema>;

export const GetListBookingResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        bookings: z.array(
            z.object({
                _id: objectIdStringSchema,
                bookingTime: z.string(),
                status: z.nativeEnum(BookingStatus),
                totalPrice: z.number(),
                paymentStatus: z.nativeEnum(PaymentStatus),
            })
        ),
        pagination: PaginationSchema,
    }),
});
export type GetListBookingResType = z.infer<typeof GetListBookingResSchema>;

export const GetBookingByIdResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        bookings: z.object({
            _id: objectIdStringSchema,
            userId: objectIdStringSchema,
            flightId: objectIdStringSchema,
            bookingTime: z.string(),
            status: z.nativeEnum(BookingStatus),
            totalPrice: z.number(),
            paymentStatus: z.nativeEnum(PaymentStatus),
        }),
        user: z.object({
            _id: objectIdStringSchema,
            username: z.string(),
            email: z.string(),
            phoneNumber: z.string(),
            gender: z.nativeEnum(UserGender),
            address: z.string(),
            avatar: z.string(),
            coverPhoto: z.string(),
            tickets: z.array(objectIdStringSchema),
            dateOfBirth: z.string(),
        }),
        flight: z.object({
            _id: objectIdStringSchema,
            flightNumber: z.string(),
            airlineId: objectIdStringSchema,
            aircraftId: objectIdStringSchema,
            departureAirportId: objectIdStringSchema,
            arrivalAirportId: objectIdStringSchema,
            departureTime: z.string(),
            arrivalTime: z.string(),
            duration: z.number(),
            price: z.number(),
            availableSeats: z.number(),
        }),
        pagination: PaginationSchema,
    }),
});
export type GetBookingByIdResType = z.infer<typeof GetBookingByIdResSchema>;

export const GetBookingStatisticResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        totalBookings: z.number(),
        statusStats: z.object({
            confirmed: z.number(),
            cancelled: z.number(),
            pending: z.number(),
        }),
        paymentStats: z.object({
            pending: z.number(),
            success: z.number(),
            failed: z.number(),
        }),
        totalRevenue: z.number(),
    }),
});
export type GetBookingStatisticResType = z.infer<
    typeof GetBookingStatisticResSchema
>;

export const SearchBookingResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        bookings: z.array(
            z.object({
                _id: objectIdStringSchema,
                bookingTime: z.string(),
                status: z.nativeEnum(BookingStatus),
                totalPrice: z.number(),
                paymentStatus: z.nativeEnum(PaymentStatus),
            })
        ),
        pagination: PaginationSchema,
    }),
});

export type SearchBookingResType = z.infer<typeof SearchBookingResSchema>;

export const CreateBookingResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        booking: BookingDetailSchema,
    }),
});
export type CreateBookingResType = z.infer<typeof CreateBookingResSchema>;

export const UpdateBookingResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        booking: BookingDetailSchema,
    }),
});
export type UpdateBookingResType = z.infer<typeof UpdateBookingResSchema>;

export const DeleteBookingResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        message: z.string(),
    }),
});
export type DeleteBookingResType = z.infer<typeof DeleteBookingResSchema>;
