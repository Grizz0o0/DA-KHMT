import http from '@/lib/http';
import { UploadImageResType } from '@/schemaValidations/medias.schema';

export const mediaApiRequest = {
    uploadImage: (formData: FormData) =>
        http.post<UploadImageResType>('/v1/api/medias/upload-image', formData),
};
