import { z } from 'zod';
import { TicketStatus } from '@/constants/tickets';
import { UserGender } from '@/constants/users';
import { AircraftClass } from '@/constants/aircrafts';
// ======== COMMON ========
export const objectIdStringSchema = z
    .string()
    .length(24, 'ObjectId phải dài 24 ký tự')
    .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

export const PaginationParams = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    order: z.enum(['asc', 'desc']).default('asc'),
    sortBy: z
        .enum([
            'bookingId',
            'flightId',
            'passengerEmail',
            'passengerPassport',
            'status',
            'seatNumber',
        ])
        .default('seatNumber')
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

// Schema for passenger information
export const PassengerSchema = z.object({
    name: z.string().min(1, 'Passenger name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    dateOfBirth: z.coerce
        .string()
        .datetime()
        .refine((val) => new Date(val) <= new Date(), {
            message: 'Ngày sinh không được ở tương lai',
        }),
    gender: z.nativeEnum(UserGender),
    nationality: z.string().min(1, 'Nationality is required'),
    passportNumber: z.string(),
    idNumber: z.string(),
});
export type PassengerType = z.infer<typeof PassengerSchema>;

export const passengerFormSchema = z.object({
    passengers: z.array(PassengerSchema),
});

export type PassengerFormType = z.infer<typeof passengerFormSchema>;

// Schema for creating a ticket
export const CreateTicketSchemaWithoutUser = z.object({
    bookingId: objectIdStringSchema,
    flightId: objectIdStringSchema,
    seatNumber: z.string().min(1, 'Seat number is required'),
    seatClass: z.nativeEnum(AircraftClass),
    passenger: PassengerSchema,
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    status: z.nativeEnum(TicketStatus).default(TicketStatus.Unused).optional(),
});

export type CreateTicketFormType = z.infer<
    typeof CreateTicketSchemaWithoutUser
>;

export const CreateTicketSchema = CreateTicketSchemaWithoutUser.extend({
    userId: objectIdStringSchema,
});

export type CreateTicketTypeBody = z.infer<typeof CreateTicketSchema>;

// Schema for creating multiple tickets
export const CreateMultipleTicketsSchema = z.object({
    userId: objectIdStringSchema,
    bookingId: objectIdStringSchema,
    flightId: objectIdStringSchema,
    seatClass: z.nativeEnum(AircraftClass),
    tickets: z.array(
        z.object({
            seatNumber: z.string().min(1, 'Seat number is required'),
            passenger: PassengerSchema,
            price: z.coerce.number().min(0, 'Price must be non-negative'),
            status: z
                .nativeEnum(TicketStatus)
                .default(TicketStatus.Unused)
                .optional(),
        })
    ),
});
export type CreateMultipleTicketsTypeBody = z.infer<
    typeof CreateMultipleTicketsSchema
>;

// Schema for updating ticket status
export const UpdateTicketStatusSchema = z.object({
    status: z.nativeEnum(TicketStatus),
});

export type UpdateTicketStatusTypeBody = z.infer<
    typeof UpdateTicketStatusSchema
>;

// Schema for updating ticket
export const UpdateTicketSchema = z.object({
    seatClass: z.nativeEnum(AircraftClass).optional(),
    seatNumber: z.string().min(1, 'Seat number is required').optional(),
    passenger: PassengerSchema.optional(),
    price: z.coerce.number().min(0, 'Price must be non-negative').optional(),
    status: z.nativeEnum(TicketStatus).default(TicketStatus.Unused).optional(),
});
export type UpdateTicketTypeBody = z.infer<typeof UpdateTicketSchema>;

// Schema for searching tickets
export const SearchTicketsSchema = z
    .object({
        bookingId: objectIdStringSchema.optional(),
        flightId: objectIdStringSchema.optional(),
        seatClass: z.nativeEnum(AircraftClass).optional(),
        passengerEmail: z.string().optional(),
        passengerPassport: z.string().optional(),
        status: z.nativeEnum(TicketStatus).optional(),
        seatNumber: z.string().optional(),
    })
    .merge(PaginationParams);
export type SearchTicketsTypeQuery = z.infer<typeof SearchTicketsSchema>;

// Schema for deleting ticket
export const DeleteTicketSchema = z.object({
    ticketId: objectIdStringSchema,
});

export type DeleteTicketTypeParams = z.infer<typeof DeleteTicketSchema>;

// Schema for getting ticket by ID
export const GetTicketByIdSchema = z.object({
    ticketId: objectIdStringSchema,
});
export type GetTicketByIdTypeParams = z.infer<typeof GetTicketByIdSchema>;

// Schema for getting tickets by booking ID
export const GetTicketsByBookingIdSchema = PaginationParams;

export type GetTicketsByBookingIdTypeParams = z.infer<
    typeof GetTicketsByBookingIdSchema
>;

// Schema for getting tickets by flight ID
export const GetTicketsByFlightIdSchema = PaginationParams;
export type GetTicketsByFlightIdTypeParams = z.infer<
    typeof GetTicketsByFlightIdSchema
>;

// Schema for updating multiple tickets status
export const UpdateMultipleTicketsStatusSchema = z.object({
    ticketIds: z.array(objectIdStringSchema),
    status: z.nativeEnum(TicketStatus),
});

export type UpdateMultipleTicketsStatusTypeBody = z.infer<
    typeof UpdateMultipleTicketsStatusSchema
>;

// ======== RESPONSE ========
export const TicketDetailSchema = z.object({
    _id: objectIdStringSchema,
    bookingId: objectIdStringSchema,
    flightId: objectIdStringSchema,
    seatClass: z.nativeEnum(AircraftClass),
    seatNumber: z.string(),
    passenger: PassengerSchema,
    price: z.number(),
    status: z.nativeEnum(TicketStatus).default(TicketStatus.Unused),
});
export type TicketDetailType = z.infer<typeof TicketDetailSchema>;

export const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string().optional(),
});

export const GetListTicketResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        tickets: z.array(TicketDetailSchema),
        pagination: PaginationSchema,
    }),
});
export type GetListTicketResType = z.infer<typeof GetListTicketResSchema>;

export const GetTicketResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        ticket: TicketDetailSchema,
    }),
});
export type GetTicketResType = z.infer<typeof GetTicketResSchema>;

export const CreateTicketResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        ticket: z.object({
            acknowledged: z.boolean(),
            insertedId: objectIdStringSchema,
        }),
    }),
});
export type CreateTicketResType = z.infer<typeof CreateTicketResSchema>;

export const CreateMultipleTicketsResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        insertedCount: z.number(),
        tickets: z.array(TicketDetailSchema),
    }),
});
export type CreateMultipleTicketsResType = z.infer<
    typeof CreateMultipleTicketsResSchema
>;

export const UpdateTicketResSchema = BaseResponseSchema.extend({
    metadata: z.object({
        ticket: TicketDetailSchema,
    }),
});
export type UpdateTicketResType = z.infer<typeof UpdateTicketResSchema>;
