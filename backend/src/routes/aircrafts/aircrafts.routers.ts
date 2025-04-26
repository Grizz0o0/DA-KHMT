import { Router } from 'express'
import aircraftsControllers from '~/controllers/aircrafts.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication, authorizeRoles } from '~/middlewares/auth.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import { authenticationSchema } from '~/requestSchemas/users.request'
import {
  createAircraftSchema,
  updateAircraftSchema,
  deleteAircraftSchema,
  getAircraftByIdSchema,
  getAircraftByAircraftCodeSchema,
  getAircraftByModelSchema,
  getAircraftByManufacturerSchema,
  searchAircraftSchema,
  getListAircraftSchema,
  filterAircraftSchema
} from '~/requestSchemas/aircrafts.request'
import { UserRole } from '~/constants/users'

const aircraftRouter = Router()

// Public routes
aircraftRouter.get(
  '/',
  validateRequest({ query: getListAircraftSchema.query }),
  asyncHandler(aircraftsControllers.getListAircraft)
)
aircraftRouter.get(
  '/search',
  validateRequest({ query: searchAircraftSchema.query }),
  asyncHandler(aircraftsControllers.searchAircraft)
)
aircraftRouter.get(
  '/filter',
  validateRequest({ query: filterAircraftSchema.query }),
  asyncHandler(aircraftsControllers.filterAircraft)
)
aircraftRouter.get(
  '/manufacturer',
  validateRequest({ query: getAircraftByManufacturerSchema.query }),
  asyncHandler(aircraftsControllers.getAircraftByManufacturer)
)
aircraftRouter.get(
  '/model',
  validateRequest({ query: getAircraftByModelSchema.query }),
  asyncHandler(aircraftsControllers.getAircraftByModel)
)
aircraftRouter.get(
  '/code/:code',
  validateRequest({ params: getAircraftByAircraftCodeSchema.params }),
  asyncHandler(aircraftsControllers.getAircraftByAircraftCode)
)
aircraftRouter.get(
  '/:aircraftId',
  validateRequest({ params: getAircraftByIdSchema.params }),
  asyncHandler(aircraftsControllers.getAircraftById)
)

// Protected routes
aircraftRouter.use(validateRequest({ headers: authenticationSchema }), authentication, authorizeRoles(UserRole.ADMIN))
aircraftRouter.post(
  '/',
  validateRequest({ body: createAircraftSchema.body }),
  asyncHandler(aircraftsControllers.createAircraft)
)
aircraftRouter.patch(
  '/:aircraftId',
  validateRequest({ params: updateAircraftSchema.params, body: updateAircraftSchema.body }),
  asyncHandler(aircraftsControllers.updateAircraft)
)
aircraftRouter.delete(
  '/:aircraftId',
  validateRequest({ params: deleteAircraftSchema.params }),
  asyncHandler(aircraftsControllers.deleteAircraft)
)

export default aircraftRouter
