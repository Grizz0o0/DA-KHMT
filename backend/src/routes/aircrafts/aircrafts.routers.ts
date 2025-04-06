import { Router } from 'express'
import aircraftsControllers from '~/controllers/aircrafts.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication } from '~/middlewares/users.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import { authenticationSchema } from '~/validators/users.validator'
const aircraftRouter = Router()

aircraftRouter.get('/', asyncHandler(aircraftsControllers.getListAircraft))
aircraftRouter.get('/search', asyncHandler(aircraftsControllers.searchAircraft))
aircraftRouter.get('/filter', asyncHandler(aircraftsControllers.filterAircraft))
aircraftRouter.get('/:aircraftId', asyncHandler(aircraftsControllers.getAircraftById))
aircraftRouter.get('/code/:code', asyncHandler(aircraftsControllers.getAircraftByAircraftCode))
aircraftRouter.get('/model/:model', asyncHandler(aircraftsControllers.getAircraftByModel))
aircraftRouter.get('/manufacturer/:manufacturer', asyncHandler(aircraftsControllers.getAircraftByManufacturer))

aircraftRouter.use(validateRequest({ headers: authenticationSchema }), authentication)
aircraftRouter.post('/', asyncHandler(aircraftsControllers.createAircraft))
aircraftRouter.patch('/:aircraftId', asyncHandler(aircraftsControllers.updateAircraft))
aircraftRouter.delete('/:aircraftId', asyncHandler(aircraftsControllers.deleteAircraft))

export default aircraftRouter
