import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK } from '~/responses/success.response'
import MediasService from '~/services/medias.services'
import path from 'node:path'
import { UPLOAD_DIR } from '~/constants/dir'

class MediasController {
  uploadImage = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new Created({
      message: 'Upload file image success',
      metadata: await MediasService.uploadImage(req)
    }).send(res)
  }

  staticImage = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    const { name } = req.params
    return res.sendFile(path.resolve(UPLOAD_DIR, name))
  }
}

export default new MediasController()
