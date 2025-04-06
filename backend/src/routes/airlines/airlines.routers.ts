import { Router } from 'express'
import airlinesControllers from '~/controllers/airlines.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication } from '~/middlewares/users.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import { authenticationSchema } from '~/validators/users.validator'
const airlinesRouter = Router()

airlinesRouter.get('/search', asyncHandler(airlinesControllers.searchAirline))
airlinesRouter.get('/', asyncHandler(airlinesControllers.getListAirline))
airlinesRouter.get('/code/:airlineCode', asyncHandler(airlinesControllers.getAirlineByCode))
airlinesRouter.get('/:airlineId', asyncHandler(airlinesControllers.getAirlineById))

airlinesRouter.use(validateRequest({ headers: authenticationSchema }), authentication)
airlinesRouter.post('/', asyncHandler(airlinesControllers.createAirline))
airlinesRouter.patch('/:airlineId', asyncHandler(airlinesControllers.updateAirline))
airlinesRouter.delete('/:airlineId', asyncHandler(airlinesControllers.deleteAirline))

export default airlinesRouter
