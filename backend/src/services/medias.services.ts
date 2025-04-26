import { Request } from 'express'

import path from 'node:path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullname, handleUploadImage } from '~/utils/files.utils'
import fs from 'fs'
import 'dotenv/config'
import { MediaType } from '~/constants/medias'
import { MediaTypeSchema, mediaSchema } from '~/requestSchemas/medias.request'

class MediasService {
  static async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: MediaTypeSchema[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        const isProduction = process.env.NODE_ENV === 'pro'

        return mediaSchema.parse({
          name: `${newName}.jpg`,
          url: isProduction
            ? `${process.env.HOST}/v1/api/medias/static/image/${newName}.jpg`
            : `http://localhost:${process.env.APP_PORT}/v1/api/medias/static/image/${newName}.jpg`,
          type: MediaType.Image
        })
      })
    )

    return { files: result }
  }
}

export default MediasService
