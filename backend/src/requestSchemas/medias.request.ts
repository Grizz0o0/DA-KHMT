import { z } from 'zod'
import { MediaType } from '~/constants/medias'

export const mediaSchema = z.object({
  name: z.string({ required_error: 'Tên file không được để trống' }).trim().min(1, 'Tên file không được để trống'),
  url: z.string({ required_error: 'URL không được để trống' }).trim().min(1, 'URL không được để trống'),
  type: z.nativeEnum(MediaType, { required_error: 'Loại media không được để trống' })
})

export type MediaTypeSchema = z.infer<typeof mediaSchema>

export const uploadImageSchema = {
  file: z.any()
}

export const staticImageSchema = {
  params: z.object({
    name: z.string({ required_error: 'Tên file không được để trống' }).trim().min(1, 'Tên file không được để trống')
  })
}

export type staticImageTypeParams = z.infer<typeof staticImageSchema.params>
