import { z } from 'zod'
import { ObjectId } from 'mongodb'

const objectIdSchema = z
  .custom<ObjectId>((val) => val instanceof ObjectId || ObjectId.isValid(val), {
    message: 'ObjectId không hợp lệ'
  })
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)))

export const createAirlineSchema = {
  body: z.object({
    name: z
      .string({ required_error: 'Tên hãng hàng không không được để trống' })
      .trim()
      .min(1, 'Tên hãng hàng không không được để trống'),
    code: z
      .string({ required_error: 'Mã hãng hàng không không được để trống' })
      .trim()
      .min(1, 'Mã hãng hàng không không được để trống')
      .max(3, 'Mã hãng hàng không không được quá 3 ký tự')
      .toUpperCase(),
    logo: z.string().trim().optional(),
    description: z.string().trim().optional()
  })
}

export type createAirlineTypeBody = z.infer<typeof createAirlineSchema.body>

export const updateAirlineSchema = {
  body: z.object({
    name: z.string().trim().min(1, 'Tên hãng hàng không không được để trống').optional(),
    code: z
      .string()
      .trim()
      .min(1, 'Mã hãng hàng không không được để trống')
      .max(3, 'Mã hãng hàng không không được quá 3 ký tự')
      .toUpperCase()
      .optional(),
    logo: z.string().trim().optional(),
    description: z.string().trim().optional()
  }),
  params: z.object({
    airlineId: objectIdSchema
  })
}

export type updateAirlineTypeBody = z.infer<typeof updateAirlineSchema.body>
export type updateAirlineTypeParams = z.infer<typeof updateAirlineSchema.params>

export const deleteAirlineSchema = {
  params: z.object({
    airlineId: objectIdSchema
  })
}

export type deleteAirlineTypeParams = z.infer<typeof deleteAirlineSchema.params>

export const searchAirlineSchema = {
  query: z.object({
    content: z.string().optional(),
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    select: z.array(z.string()).optional()
  })
}

export type searchAirlineTypeQuery = z.infer<typeof searchAirlineSchema.query>

export const getListAirlineSchema = {
  query: z.object({
    limit: z.coerce.number().int('Giới hạn phải là số nguyên').positive('Giới hạn phải > 0').optional(),
    page: z.coerce.number().int('Số trang phải là số nguyên').positive('Số trang phải > 0').optional(),
    order: z.string().optional(),
    select: z.array(z.string()).optional()
  })
}

export type getListAirlineTypeQuery = z.infer<typeof getListAirlineSchema.query>

export const getAirlineByIdSchema = {
  params: z.object({
    airlineId: objectIdSchema
  })
}

export type getAirlineByIdTypeParams = z.infer<typeof getAirlineByIdSchema.params>

export const getAirlineByCodeSchema = {
  params: z.object({
    airlineCode: z
      .string({ required_error: 'Mã hãng hàng không không được để trống' })
      .trim()
      .min(1, 'Mã hãng hàng không không được để trống')
      .toUpperCase()
  })
}

export type getAirlineByCodeTypeParams = z.infer<typeof getAirlineByCodeSchema.params>
