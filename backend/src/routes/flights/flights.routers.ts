import { Router } from 'express'
import flightsControllers from '~/controllers/flights.controllers'
import { asyncHandler } from '~/helper/asyncHandler'
import { authentication, authorizeRoles } from '~/middlewares/auth.middlewares'
import { validateRequest } from '~/middlewares/validate.middleware'
import { authenticationSchema } from '~/requestSchemas/users.request'
import {
  createFlightSchema,
  deleteFlightSchema,
  getFlightByAirlineIdSchema,
  getFlightByAircraftIdSchema,
  getFlightByArrivalAirportIdSchema,
  getFlightByDepartureAirportIdSchema,
  getFlightByFlightNumberSchema,
  getFlightByIdSchema,
  updateFlightSchema,
  getListFlightSchema,
  searchFlightSchema,
  filterFlightSchema
} from '~/requestSchemas/flights.request'
import { UserRole } from '~/constants/users'
const flightsRouter = Router()

// Get list flights with pagination and sorting
flightsRouter.get(
  '/',
  validateRequest({ query: getListFlightSchema.query }),
  asyncHandler(flightsControllers.getListFlights)
)

// Search flights
flightsRouter.get(
  '/search',
  validateRequest({ query: searchFlightSchema.query }),
  asyncHandler(flightsControllers.searchFlights)
)

// Filter flights
flightsRouter.get(
  '/filter',
  validateRequest({ query: filterFlightSchema.query }),
  asyncHandler(flightsControllers.filterFlights)
)

// Get flight by ID
flightsRouter.get(
  '/:id',
  validateRequest({ params: getFlightByIdSchema.params }),
  asyncHandler(flightsControllers.getFlightById)
)

flightsRouter.use(validateRequest({ headers: authenticationSchema }), authentication)

// Create new flight
flightsRouter.post(
  '/',
  validateRequest({ body: createFlightSchema.body }),
  authorizeRoles(UserRole.ADMIN),
  asyncHandler(flightsControllers.createFLight)
)

// Update flight
flightsRouter.patch(
  '/:id',
  validateRequest({ body: updateFlightSchema.body, params: updateFlightSchema.params }),
  authorizeRoles(UserRole.ADMIN),
  asyncHandler(flightsControllers.updateFlight)
)

// Delete flight
flightsRouter.delete(
  '/:id',
  validateRequest({ params: deleteFlightSchema.params }),
  authorizeRoles(UserRole.ADMIN),
  asyncHandler(flightsControllers.deleteFlight)
)

// Get flight by flight number
flightsRouter.get(
  '/number/:flightNumber',
  validateRequest({ params: getFlightByFlightNumberSchema.params }),
  asyncHandler(flightsControllers.getFlightByFlightNumber)
)

// Get flight by airline ID
flightsRouter.get(
  '/airline/:airlineId',
  validateRequest({ params: getFlightByAirlineIdSchema.params }),
  asyncHandler(flightsControllers.getFlightByAirlineId)
)

// Get flight by aircraft ID
flightsRouter.get(
  '/aircraft/:aircraftId',
  validateRequest({ params: getFlightByAircraftIdSchema.params }),
  asyncHandler(flightsControllers.getFlightByAircraftId)
)

// Get flight by departure airport ID
flightsRouter.get(
  '/departure-airport/:departureAirportId',
  validateRequest({ params: getFlightByDepartureAirportIdSchema.params }),
  asyncHandler(flightsControllers.getFlightByDepartureAirportId)
)

// Get flight by arrival airport ID
flightsRouter.get(
  '/arrival-airport/:arrivalAirportId',
  validateRequest({ params: getFlightByArrivalAirportIdSchema.params }),
  asyncHandler(flightsControllers.getFlightByArrivalAirportId)
)

export default flightsRouter
