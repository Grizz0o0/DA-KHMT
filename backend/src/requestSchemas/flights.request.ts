import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { AircraftClass } from '~/constants/aircrafts'

const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const FareOptionSchema = z.object({
  class: z.nativeEnum(AircraftClass).default(AircraftClass.Economy),
  price: z.coerce.number().nonnegative('Giá vé phải lớn hơn hoặc bằng 0'),
  availableSeats: z.coerce.number().int('Số ghế phải là số nguyên').nonnegative('Số ghế phải >= 0'),
  perks: z.array(z.string()).default([])
})

export const FareOptionFilterSchema = z.object({
  class: z.nativeEnum(AircraftClass).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minAvailableSeats: z.coerce.number().int().nonnegative().optional(),
  maxAvailableSeats: z.coerce.number().int().nonnegative().optional()
})

const paginationParams = {
  page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').default(1),
  limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').default(10),
  order: z.enum(['asc', 'desc']).default('asc'),
  sortBy: z.enum(['departureTime', 'arrivalTime', 'price', 'availableSeats']).default('departureTime')
}

export const createFlightSchema = {
  body: z.object({
    flightNumber: z.string().trim().min(1, 'Số hiệu chuyến bay không được để trống'),
    airlineId: objectIdSchema,
    aircraftId: objectIdSchema,
    departureAirportId: objectIdSchema,
    arrivalAirportId: objectIdSchema,
    departureTime: z.coerce.date({ required_error: 'Thời gian khởi hành không được để trống' }),
    arrivalTime: z.coerce.date({ required_error: 'Thời gian đến không được để trống' }),
    duration: z.coerce
      .number({ required_error: 'Thời gian bay không được để trống' })
      .positive('Thời gian bay phải là số dương'),
    fareOptions: z.array(FareOptionSchema).min(1)
  })
}
export type createFlightTypeBody = z.infer<typeof createFlightSchema.body>

export const updateFlightSchema = {
  body: z.object({
    flightNumber: z.string().optional(),
    airlineId: objectIdSchema.optional(),
    aircraftId: objectIdSchema.optional(),
    departureAirportId: objectIdSchema.optional(),
    arrivalAirportId: objectIdSchema.optional(),
    departureTime: z.coerce.date().optional(),
    arrivalTime: z.coerce.date().optional(),
    duration: z.coerce.number().positive('Thời gian bay phải là số dương').optional(),
    fareOptions: z.array(FareOptionSchema).optional()
  }),
  params: z.object({
    id: objectIdSchema
  })
}
export type updateFlightTypeBody = z.infer<typeof updateFlightSchema.body>

export const deleteFlightSchema = {
  params: z.object({
    id: objectIdSchema
  })
}
export type deleteFlightTypeParams = z.infer<typeof deleteFlightSchema.params>

export const getFlightByIdSchema = {
  params: z.object({
    id: objectIdSchema
  })
}
export type getFlightByIdTypeParams = z.infer<typeof getFlightByIdSchema.params>

export const filterFlightSchema = {
  query: z
    .object({
      flightNumber: z.string().optional(),
      airlineIds: z.union([z.string().nonempty(), z.array(z.string().nonempty())]).optional(),
      departureAirportId: objectIdSchema.optional(),
      arrivalAirportId: objectIdSchema.optional(),
      type: z.enum(['khu-hoi', 'mot-chieu']).default('mot-chieu'),
      departureTime: z.coerce.date().optional(),
      returnTime: z
        .any()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
          message: 'Ngày đến không hợp lệ'
        })
        .transform((val) => (val ? new Date(val) : undefined)),
      departureAirportCode: z.string().optional(),
      arrivalAirportCode: z.string().optional(),
      passengerCount: z.coerce.number().optional(),
      duration: z.coerce.number().positive().optional(),
      minHour: z.coerce.number().min(0).max(23).optional(),
      maxHour: z.coerce.number().min(0).max(23).optional(),
      ...paginationParams
    })
    .merge(FareOptionFilterSchema)
}
export type filterFlightTypeQuery = z.infer<typeof filterFlightSchema.query>

export const getListFlightSchema = {
  query: z.object(paginationParams)
}
export type getListFlightTypeQuery = z.infer<typeof getListFlightSchema.query>

export const searchFlightSchema = {
  query: z.object({
    departureAirport: z.string().trim().min(1, 'Điểm đi là bắt buộc').optional(),
    arrivalAirport: z.string().trim().min(1, 'Điểm đến là bắt buộc').optional(),
    departureTime: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'Ngày khởi hành không hợp lệ'
      })
      .optional(),

    arrivalTime: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'Ngày đến không hợp lệ'
      })
      .optional(),
    passengerCount: z.coerce.number().int().min(1).default(1),
    ...paginationParams
  })
}
export type searchFlightTypeQuery = z.infer<typeof searchFlightSchema.query>

export const getFlightByFlightNumberSchema = {
  params: z.object({
    flightNumber: z
      .string({ required_error: 'Số hiệu chuyến bay không được để trống' })
      .min(1, 'Số hiệu chuyến bay không được để trống')
      .trim()
  })
}
export type getFlightByFlightNumberTypeParams = z.infer<typeof getFlightByFlightNumberSchema.params>

export const getFlightByAirlineIdSchema = {
  params: z.object({
    airlineId: objectIdSchema
  }),
  query: z.object(paginationParams)
}
export type getFlightByAirlineIdTypeParams = z.infer<typeof getFlightByAirlineIdSchema.params>
export type getFlightByAirlineIdTypeQuery = z.infer<typeof getFlightByAirlineIdSchema.query>

export const getFlightByAircraftIdSchema = {
  params: z.object({
    aircraftId: objectIdSchema
  }),
  query: z.object(paginationParams)
}
export type getFlightByAircraftIdTypeParams = z.infer<typeof getFlightByAircraftIdSchema.params>
export type getFlightByAircraftIdTypeQuery = z.infer<typeof getFlightByAircraftIdSchema.query>

export const getFlightByDepartureAirportIdSchema = {
  params: z.object({
    departureAirportId: objectIdSchema
  }),
  query: z.object(paginationParams)
}
export type getFlightByDepartureAirportIdTypeParams = z.infer<typeof getFlightByDepartureAirportIdSchema.params>
export type getFlightByDepartureAirportIdTypeQuery = z.infer<typeof getFlightByDepartureAirportIdSchema.query>

export const getFlightByArrivalAirportIdSchema = {
  params: z.object({
    arrivalAirportId: objectIdSchema
  }),
  query: z.object(paginationParams)
}
export type getFlightByArrivalAirportIdTypeParams = z.infer<typeof getFlightByArrivalAirportIdSchema.params>
export type getFlightByArrivalAirportIdTypeQuery = z.infer<typeof getFlightByArrivalAirportIdSchema.query>

export const getFlightByTimeRangeSchema = {
  params: z.object({
    startTime: z.coerce.date({ required_error: 'Thời gian bắt đầu không được để trống' }),
    endTime: z.coerce.date({ required_error: 'Thời gian kết thúc không được để trống' }),
    type: z.enum(['departure', 'arrival']).default('departure')
  }),
  query: z.object(paginationParams)
}
export type getFlightByTimeRangeTypeParams = z.infer<typeof getFlightByTimeRangeSchema.params>
export type getFlightByTimeRangeTypeQuery = z.infer<typeof getFlightByTimeRangeSchema.query>
