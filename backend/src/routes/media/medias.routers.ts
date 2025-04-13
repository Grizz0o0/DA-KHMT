import { Router } from 'express'
import mediasControllers from '~/controllers/medias.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { validateRequest } from '~/middlewares/validate.middleware'
import { staticImageSchema } from '~/requestSchemas/medias.request'

const mediasRouter = Router()

mediasRouter.post('/upload-image', asyncHandler(mediasControllers.uploadImage))
mediasRouter.get(
  '/static/image/:name',
  validateRequest({ params: staticImageSchema.params }),
  asyncHandler(mediasControllers.staticImage)
)

export default mediasRouter
