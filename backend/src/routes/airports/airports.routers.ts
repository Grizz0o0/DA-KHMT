import { Router } from 'express'
import airportsControllers from '~/controllers/airports.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication } from '~/middlewares/users.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import { authenticationSchema } from '~/validators/users.validator'
const airportsRouter = Router()

airportsRouter.get('/search', asyncHandler(airportsControllers.searchAirport))
airportsRouter.get('/filter', asyncHandler(airportsControllers.filterAirport))
airportsRouter.get('/', asyncHandler(airportsControllers.getListAirport))
airportsRouter.get('/code/:airportCode', asyncHandler(airportsControllers.getAirportByCode))
airportsRouter.get('/:airportId', asyncHandler(airportsControllers.getAirportById))

airportsRouter.use(validateRequest({ headers: authenticationSchema }), authentication)

airportsRouter.post('/', asyncHandler(airportsControllers.createAirport))
airportsRouter.patch('/:airportId', asyncHandler(airportsControllers.updateAirport))
airportsRouter.delete('/:airportId', asyncHandler(airportsControllers.deleteAirport))

export default airportsRouter
