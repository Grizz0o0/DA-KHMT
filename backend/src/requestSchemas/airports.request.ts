import { z } from 'zod'
import { ObjectId } from 'mongodb'

const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const createAirportSchema = {
  body: z.object({
    name: z
      .string({ required_error: 'Tên sân bay không được để trống' })
      .trim()
      .min(1, 'Tên sân bay không được để trống'),
    code: z
      .string({ required_error: 'Mã sân bay không được để trống' })
      .trim()
      .min(1, 'Mã sân bay không được để trống')
      .max(5, 'Mã sân bay không được quá 5 ký tự')
      .toUpperCase(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    country: z.string().trim().optional()
  })
}

export type createAirportTypeBody = z.infer<typeof createAirportSchema.body>

export const updateAirportSchema = {
  body: z.object({
    name: z.string().trim().min(1, 'Tên sân bay không được để trống').optional(),
    code: z
      .string()
      .trim()
      .min(1, 'Mã sân bay không được để trống')
      .max(5, 'Mã sân bay không được quá 5 ký tự')
      .toUpperCase()
      .optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    country: z.string().trim().optional()
  }),
  params: z.object({
    airportId: objectIdSchema
  })
}

export type updateAirportTypeBody = z.infer<typeof updateAirportSchema.body>
export type updateAirportTypeParams = z.infer<typeof updateAirportSchema.params>

export const deleteAirportSchema = {
  params: z.object({
    airportId: objectIdSchema
  })
}

export type deleteAirportTypeParams = z.infer<typeof deleteAirportSchema.params>

export const searchAirportSchema = {
  query: z.object({
    content: z.string({ required_error: 'Nội dung tìm kiếm không được để trống' }),
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    select: z.array(z.string()).optional()
  })
}

export type searchAirportTypeQuery = z.infer<typeof searchAirportSchema.query>

export const getListAirportSchema = {
  query: z.object({
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    order: z.enum(['asc', 'desc']).optional(),
    select: z.array(z.string()).optional()
  })
}
export type getListAirportTypeQuery = z.infer<typeof getListAirportSchema.query>

export const filterAirportSchema = {
  query: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    order: z.enum(['asc', 'desc']).optional(),
    select: z.array(z.string()).optional()
  })
}

export type filterAirportTypeQuery = z.infer<typeof filterAirportSchema.query>

export const getAirportByIdSchema = {
  params: z.object({
    airportId: objectIdSchema
  })
}

export type getAirportByIdTypeParams = z.infer<typeof getAirportByIdSchema.params>

export const getAirportByCodeSchema = {
  params: z.object({
    code: z
      .string({ required_error: 'Mã sân bay không được để trống' })
      .trim()
      .min(1, 'Mã sân bay không được để trống')
      .toUpperCase()
  })
}

export type getAirportByCodeTypeParams = z.infer<typeof getAirportByCodeSchema.params>
