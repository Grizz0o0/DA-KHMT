import { Router } from 'express'
import mediasControllers from '~/controllers/medias.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { validateRequest } from '~/middlewares/validate.middleware'
import { staticImageSchema } from '~/requestSchemas/medias.request'
import { authenticationSchema } from '~/requestSchemas/users.request'
import { authentication } from '~/middlewares/auth.middlewares'

const mediasRouter = Router()
mediasRouter.get(
  '/static/image/:name',
  validateRequest({ params: staticImageSchema.params }),
  asyncHandler(mediasControllers.staticImage)
)
mediasRouter.use(validateRequest({ headers: authenticationSchema }), authentication)
mediasRouter.post('/upload-image', asyncHandler(mediasControllers.uploadImage))

export default mediasRouter
