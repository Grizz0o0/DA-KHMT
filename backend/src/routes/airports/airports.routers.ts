import { Router } from 'express'
import airportsControllers from '~/controllers/airports.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication, authorizeRoles } from '~/middlewares/auth.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import { authenticationSchema } from '~/requestSchemas/users.request'
import {
  createAirportSchema,
  updateAirportSchema,
  deleteAirportSchema,
  getAirportByIdSchema,
  getAirportByCodeSchema,
  searchAirportSchema,
  getListAirportSchema,
  filterAirportSchema
} from '~/requestSchemas/airports.request'
import { UserRole } from '~/constants/users'
const airportsRouter = Router()

// Public routes
airportsRouter.get(
  '/',
  validateRequest({ query: getListAirportSchema.query }),
  asyncHandler(airportsControllers.getListAirport)
)
airportsRouter.get(
  '/search',
  validateRequest({ query: searchAirportSchema.query }),
  asyncHandler(airportsControllers.searchAirport)
)
airportsRouter.get(
  '/filter',
  validateRequest({ query: filterAirportSchema.query }),
  asyncHandler(airportsControllers.filterAirport)
)
airportsRouter.get(
  '/code/:code',
  validateRequest({ params: getAirportByCodeSchema.params }),
  asyncHandler(airportsControllers.getAirportByCode)
)
airportsRouter.get(
  '/:airportId',
  validateRequest({ params: getAirportByIdSchema.params }),
  asyncHandler(airportsControllers.getAirportById)
)

// Protected routes
airportsRouter.use(validateRequest({ headers: authenticationSchema }), authentication, authorizeRoles(UserRole.ADMIN))
airportsRouter.post(
  '/',
  validateRequest({ body: createAirportSchema.body }),
  asyncHandler(airportsControllers.createAirport)
)
airportsRouter.patch(
  '/:airportId',
  validateRequest({ params: updateAirportSchema.params, body: updateAirportSchema.body }),
  asyncHandler(airportsControllers.updateAirport)
)
airportsRouter.delete(
  '/:airportId',
  validateRequest({ params: deleteAirportSchema.params }),
  asyncHandler(airportsControllers.deleteAirport)
)

export default airportsRouter
