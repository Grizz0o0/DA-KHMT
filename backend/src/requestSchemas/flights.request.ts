import { z } from 'zod'
import { ObjectId } from 'mongodb'

const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

// Common pagination and sorting parameters
const paginationParams = {
  page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').default(1),
  limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').default(10),
  order: z.enum(['asc', 'desc']).default('asc'),
  sortBy: z.enum(['departureTime', 'arrivalTime', 'price', 'availableSeats']).default('departureTime')
}

export const createFlightSchema = {
  body: z.object({
    flightNumber: z
      .string({ required_error: 'Số hiệu chuyến bay không được để trống' })
      .trim()
      .min(1, 'Số hiệu chuyến bay không được để trống'),
    airlineId: objectIdSchema,
    aircraftId: objectIdSchema,
    departureAirportId: objectIdSchema,
    arrivalAirportId: objectIdSchema,
    departureTime: z.coerce.date({ required_error: 'Thời gian khởi hành không được để trống' }),
    arrivalTime: z.coerce.date({ required_error: 'Thời gian đến không được để trống' }),
    duration: z.coerce
      .number({ required_error: 'Thời gian bay không được để trống' })
      .positive('Thời gian bay phải là số dương'),
    price: z.coerce
      .number({ required_error: 'Giá vé không được để trống' })
      .nonnegative('Giá vé phải lớn hơn hoặc bằng 0'),
    availableSeats: z.coerce
      .number({ required_error: 'Số ghế còn trống không được để trống' })
      .int('Số ghế phải là số nguyên')
      .nonnegative('Số ghế phải >= 0')
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
    price: z.coerce.number().nonnegative('Giá vé phải lớn hơn hoặc bằng 0').optional(),
    availableSeats: z.coerce.number().int('Số ghế phải là số nguyên').nonnegative('Số ghế phải >= 0').optional()
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
  query: z.object({
    flightNumber: z.string().optional(),
    airlineId: objectIdSchema.optional(),
    aircraftId: objectIdSchema.optional(),
    departureAirportId: objectIdSchema.optional(),
    arrivalAirportId: objectIdSchema.optional(),
    departureTime: z.coerce.date().optional(),
    arrivalTime: z.coerce.date().optional(),
    duration: z.coerce.number().positive('Thời gian bay phải là số dương').optional(),
    price: z.coerce.number().nonnegative('Giá vé phải lớn hơn hoặc bằng 0').optional(),
    availableSeats: z.coerce.number().int('Số ghế phải là số nguyên').nonnegative('Số ghế phải >= 0').optional(),
    ...paginationParams
  })
}
export type filterFlightTypeQuery = z.infer<typeof filterFlightSchema.query>

export const getListFlightSchema = {
  query: z.object(paginationParams)
}
export type getListFlightTypeQuery = z.infer<typeof getListFlightSchema.query>

export const searchFlightSchema = {
  query: z.object({
    content: z.string().optional(),
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
