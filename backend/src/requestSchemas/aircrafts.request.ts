import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { AircraftStatus } from '~/constants/aircrafts'

const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

const seatClassConfigSchema = z.object({
  rows: z
    .number({ required_error: 'Số hàng ghế không được để trống' })
    .int('Số hàng ghế phải là số nguyên')
    .positive('Số hàng ghế phải > 0'),
  seatsPerRow: z
    .number({ required_error: 'Số ghế mỗi hàng không được để trống' })
    .int('Số ghế mỗi hàng phải là số nguyên')
    .positive('Số ghế mỗi hàng phải > 0')
})

export const createAircraftSchema = {
  body: z.object({
    model: z
      .string({ required_error: 'Model máy bay không được để trống' })
      .trim()
      .min(1, 'Model máy bay không được để trống'),
    manufacturer: z
      .string({ required_error: 'Hãng sản xuất không được để trống' })
      .trim()
      .min(1, 'Hãng sản xuất không được để trống'),
    airlineId: objectIdSchema,
    aircraftCode: z
      .string({ required_error: 'Mã máy bay không được để trống' })
      .trim()
      .min(1, 'Mã máy bay không được để trống'),
    seatConfiguration: z
      .object({
        economy: seatClassConfigSchema.optional(),
        business: seatClassConfigSchema.optional(),
        firstClass: seatClassConfigSchema.optional()
      })
      .refine((data) => data.economy || data.business || data.firstClass, 'Phải có ít nhất một hạng ghế được cấu hình')
  })
}

export type createAircraftTypeBody = z.infer<typeof createAircraftSchema.body>

export const updateAircraftSchema = {
  body: z.object({
    model: z.string().trim().min(1, 'Model máy bay không được để trống').optional(),
    manufacturer: z.string().trim().min(1, 'Hãng sản xuất không được để trống').optional(),
    seatConfiguration: z
      .object({
        economy: seatClassConfigSchema.optional(),
        business: seatClassConfigSchema.optional(),
        firstClass: seatClassConfigSchema.optional()
      })
      .optional(),
    capacity: z.number().int('Sức chứa phải là số nguyên').positive('Sức chứa phải > 0').optional()
  }),
  params: z.object({
    aircraftId: objectIdSchema
  })
}

export type updateAircraftTypeBody = z.infer<typeof updateAircraftSchema.body>
export type updateAircraftTypeParams = z.infer<typeof updateAircraftSchema.params>

export const deleteAircraftSchema = {
  params: z.object({
    aircraftId: objectIdSchema
  })
}

export type deleteAircraftTypeParams = z.infer<typeof deleteAircraftSchema.params>

export const searchAircraftSchema = {
  query: z.object({
    content: z.string().optional(),
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    select: z.array(z.string()).optional()
  })
}

export type searchAircraftTypeQuery = z.infer<typeof searchAircraftSchema.query>

export const getListAircraftSchema = {
  query: z.object({
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    order: z.string().optional(),
    select: z.array(z.string()).optional()
  })
}

export type getListAircraftTypeQuery = z.infer<typeof getListAircraftSchema.query>

export const getAircraftByIdSchema = {
  params: z.object({
    aircraftId: objectIdSchema
  })
}

export type getAircraftByIdTypeParams = z.infer<typeof getAircraftByIdSchema.params>

export const getAircraftByAircraftCodeSchema = {
  params: z.object({
    code: z.string({ required_error: 'Mã máy bay không được để trống' }).trim().min(1, 'Mã máy bay không được để trống')
  })
}

export type getAircraftByAircraftCodeTypeParams = z.infer<typeof getAircraftByAircraftCodeSchema.params>

export const getAircraftByModelSchema = {
  query: z.object({
    model: z
      .string({ required_error: 'Model máy bay không được để trống' })
      .trim()
      .min(1, 'Model máy bay không được để trống')
      .optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional()
  })
}

export type getAircraftByModelTypeQuery = z.infer<typeof getAircraftByModelSchema.query>

export const getAircraftByManufacturerSchema = {
  query: z.object({
    manufacturer: z
      .string({ required_error: 'Hãng sản xuất không được để trống' })
      .trim()
      .min(1, 'Hãng sản xuất không được để trống')
      .optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional()
  })
}

export type getAircraftByManufacturerTypeQuery = z.infer<typeof getAircraftByManufacturerSchema.query>

export const filterAircraftSchema = {
  query: z.object({
    model: z.string().optional(),
    manufacturer: z.string().optional(),
    aircraftCode: z.string().optional(),
    status: z.enum([AircraftStatus.Active, AircraftStatus.Maintenance, AircraftStatus.Retired]).optional(),
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    order: z.string().optional(),
    select: z.array(z.string()).optional()
  })
}

export type filterAircraftTypeQuery = z.infer<typeof filterAircraftSchema.query>
