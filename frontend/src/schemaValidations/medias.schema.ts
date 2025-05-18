import { z } from 'zod';
import { MediaType } from '@/constants/medias';

// Schema cơ bản cho phản hồi chung
export const BaseResponseSchema = z.object({
    message: z.string(),
    statusCode: z.number(),
    reasonStatusCode: z.string(),
    timestamp: z.string(),
});

// Schema cho từng file ảnh sau khi upload
export const mediaSchema = z.object({
    name: z
        .string({ required_error: 'Tên file không được để trống' })
        .trim()
        .min(1, 'Tên file không được để trống'),
    url: z
        .string({ required_error: 'URL không được để trống' })
        .trim()
        .min(1, 'URL không được để trống'),
    type: z.nativeEnum(MediaType, {
        required_error: 'Loại media không được để trống',
    }),
});

// Schema cho response trả về sau khi upload ảnh
export const UploadImageResSchema = z.object({
    message: z.string(),
    statusCode: z.literal(201),
    reasonStatusCode: z.literal('Created'),
    metadata: z.object({
        image: z.object({
            files: z.array(mediaSchema),
        }),
    }),
    timestamp: z.string(),
});
export type UploadImageResType = z.infer<typeof UploadImageResSchema>;

// Schema để validate dữ liệu gửi lên khi upload
export const uploadImageSchema = {
    file: z.any(),
};

// Schema cho việc truy cập ảnh tĩnh qua URL
export const staticImageSchema = {
    params: z.object({
        name: z
            .string({ required_error: 'Tên file không được để trống' })
            .trim()
            .min(1, 'Tên file không được để trống'),
    }),
};

export type staticImageTypeParams = z.infer<typeof staticImageSchema.params>;
