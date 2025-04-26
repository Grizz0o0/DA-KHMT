import { z } from 'zod'
import { ObjectId } from 'mongodb'

const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const flightSchema = z.object({
  _id: objectIdSchema.default(() => new ObjectId()),
  flightNumber: z.string().min(1, 'Số hiệu chuyến bay không được để trống'),
  airlineId: objectIdSchema,
  aircraftId: objectIdSchema,
  departureAirportId: objectIdSchema,
  arrivalAirportId: objectIdSchema,
  departureTime: z.coerce.date(),
  arrivalTime: z.coerce.date(),
  duration: z.number().positive('Thời gian bay phải là số dương'),
  price: z.number().nonnegative('Giá vé phải lớn hơn hoặc bằng 0'),
  availableSeats: z.number().int().nonnegative('Số ghế phải >= 0'),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
})

export type FlightType = z.infer<typeof flightSchema>
