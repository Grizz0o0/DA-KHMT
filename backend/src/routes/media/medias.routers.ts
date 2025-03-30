import { Router } from 'express'
import mediasControllers from '~/controllers/medias.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
const mediasRouter = Router()

mediasRouter.post('/upload-image', asyncHandler(mediasControllers.uploadImage))
mediasRouter.get('/static/image/:name', asyncHandler(mediasControllers.staticImage))

export default mediasRouter
