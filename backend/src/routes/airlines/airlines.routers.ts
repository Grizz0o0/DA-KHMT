import { Router } from 'express'
import airlinesControllers from '~/controllers/airlines.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication, authorizeRoles } from '~/middlewares/auth.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import { authenticationSchema } from '~/requestSchemas/users.request'
import {
  searchAirlineSchema,
  getListAirlineSchema,
  getAirlineByCodeSchema,
  getAirlineByIdSchema
} from '~/requestSchemas/airlines.request'
import { UserRole } from '~/constants/users'
const airlinesRouter = Router()

airlinesRouter.get(
  '/search',
  validateRequest({ query: searchAirlineSchema.query }),
  asyncHandler(airlinesControllers.searchAirline)
)
airlinesRouter.get(
  '/',
  validateRequest({ query: getListAirlineSchema.query }),
  asyncHandler(airlinesControllers.getListAirline)
)
airlinesRouter.get(
  '/code/:airlineCode',
  validateRequest({ params: getAirlineByCodeSchema.params }),
  asyncHandler(airlinesControllers.getAirlineByCode)
)
airlinesRouter.get(
  '/:airlineId',
  validateRequest({ params: getAirlineByIdSchema.params }),
  asyncHandler(airlinesControllers.getAirlineById)
)

airlinesRouter.use(validateRequest({ headers: authenticationSchema }), authentication, authorizeRoles(UserRole.ADMIN))
airlinesRouter.post('/', asyncHandler(airlinesControllers.createAirline))
airlinesRouter.patch('/:airlineId', asyncHandler(airlinesControllers.updateAirline))
airlinesRouter.delete('/:airlineId', asyncHandler(airlinesControllers.deleteAirline))

export default airlinesRouter
