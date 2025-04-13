import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { AircraftStatus } from '~/constants/aircrafts'
import { convertToObjectId } from '~/utils/mongoUtils'

// Định nghĩa schema cho cấu hình ghế (SeatClassConfig)
const seatClassConfigSchema = z.object({
  rows: z.number(),
  seatsPerRow: z.number()
})

// Định nghĩa schema cho seatConfiguration
const seatConfigurationSchema = z.object({
  economy: seatClassConfigSchema.optional(),
  business: seatClassConfigSchema.optional(),
  firstClass: seatClassConfigSchema.optional()
})

const objectIdSchema = z
  .any()
  .refine((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'Invalid ObjectId'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const aircraftSchema = z
  .object({
    _id: objectIdSchema.default(() => new ObjectId()),
    model: z.string(),
    manufacturer: z.string(),
    airlineId: z.instanceof(ObjectId).transform((val) => new ObjectId(val)),
    seatConfiguration: seatConfigurationSchema,
    aircraftCode: z.string(),
    capacity: z.number().optional(),
    status: z.nativeEnum(AircraftStatus).default(AircraftStatus.Active),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date())
  })
  .transform((data) => {
    // Tính toán capacity từ seatConfiguration
    const { seatConfiguration } = data
    let total = 0
    if (seatConfiguration.economy) {
      total += seatConfiguration.economy.rows * seatConfiguration.economy.seatsPerRow
    }
    if (seatConfiguration.business) {
      total += seatConfiguration.business.rows * seatConfiguration.business.seatsPerRow
    }
    if (seatConfiguration.firstClass) {
      total += seatConfiguration.firstClass.rows * seatConfiguration.firstClass.seatsPerRow
    }
    return { ...data, capacity: total }
  })

export type AircraftType = z.infer<typeof aircraftSchema>
