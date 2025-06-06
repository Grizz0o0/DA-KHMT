import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK } from '~/responses/success.response'
import FlightServices from '~/services/flights.services'
import { BadRequestError } from '~/responses/error.response'
import {
  deleteFlightSchema,
  deleteFlightTypeParams,
  getFlightByAircraftIdSchema,
  getFlightByAircraftIdTypeParams,
  getFlightByAirlineIdSchema,
  getFlightByAirlineIdTypeParams,
  getFlightByArrivalAirportIdSchema,
  getFlightByArrivalAirportIdTypeParams,
  getFlightByDepartureAirportIdSchema,
  getFlightByDepartureAirportIdTypeParams,
  getFlightByFlightNumberSchema,
  getFlightByFlightNumberTypeParams,
  getFlightByIdSchema,
  getFlightByIdTypeParams,
  getListFlightSchema,
  searchFlightSchema,
  filterFlightSchema,
  updateFlightSchema,
  createFlightSchema
} from '~/requestSchemas/flights.request'

class FlightController {
  createFLight = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const resultBody = createFlightSchema.body.parse(req.body)
      const newFlight = await FlightServices.createFlight(resultBody)
      new Created({
        message: 'Create flight success',
        metadata: { flight: newFlight }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  updateFlight = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const resultParams = updateFlightSchema.params.parse(req.params)
      const resultBody = updateFlightSchema.body.parse(req.body)

      const updatedFlight = await FlightServices.updateFlight(resultParams.id, resultBody)
      new OK({
        message: 'Update flight success',
        metadata: { flight: updatedFlight }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  deleteFlight = async (
    req: Request<ParamsDictionary, any, deleteFlightTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = deleteFlightSchema.params.safeParse(req.params)
      if (!result.success) {
        throw new BadRequestError('Invalid parameters: ' + result.error.message)
      }

      const flight = await FlightServices.deleteFlight(result.data.id)
      new OK({
        message: 'Delete flight success',
        metadata: { flight }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getFlightById = async (
    req: Request<ParamsDictionary, any, getFlightByIdTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = getFlightByIdSchema.params.safeParse(req.params)
      if (!result.success) {
        throw new BadRequestError('Invalid ID: ' + result.error.message)
      }

      const flight = await FlightServices.getFlightById(result.data.id)
      new OK({
        message: 'Get flight by id success',
        metadata: { flight }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getFlightByFlightNumber = async (
    req: Request<ParamsDictionary, any, getFlightByFlightNumberTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = getFlightByFlightNumberSchema.params.safeParse(req.params)
      if (!result.success) {
        throw new BadRequestError('Invalid flight number: ' + result.error.message)
      }

      const flightNumber = result.data.flightNumber
      if (!flightNumber) {
        throw new BadRequestError('Flight number is required')
      }

      const flight = await FlightServices.getFlightByFlightNumber(flightNumber)
      new OK({
        message: 'Get flight by flight number success',
        metadata: { flight }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getFlightByAirlineId = async (
    req: Request<ParamsDictionary, any, getFlightByAirlineIdTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resultParams = getFlightByAirlineIdSchema.params.parse(req.params)
      const resultQuery = getFlightByAirlineIdSchema.query.parse(req.query)
      const { flights, pagination } = await FlightServices.getFlightByAirlineId(resultParams.airlineId, resultQuery)
      new OK({
        message: 'Get flight by airline id success',
        metadata: { flights, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getFlightByAircraftId = async (
    req: Request<ParamsDictionary, any, getFlightByAircraftIdTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resultParams = getFlightByAircraftIdSchema.params.parse(req.params)
      const resultQuery = getFlightByAircraftIdSchema.query.parse(req.query)

      const { flights, pagination } = await FlightServices.getFlightByAircraftId(resultParams.aircraftId, resultQuery)
      new OK({
        message: 'Get flight by aircraft id success',
        metadata: { flights, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getFlightByDepartureAirportId = async (
    req: Request<ParamsDictionary, any, getFlightByDepartureAirportIdTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resultParams = getFlightByDepartureAirportIdSchema.params.parse(req.params)
      const resultQuery = getFlightByDepartureAirportIdSchema.query.parse(req.query)

      const { flights, pagination } = await FlightServices.getFlightByDepartureAirportId(
        resultParams.departureAirportId,
        resultQuery
      )
      new OK({
        message: 'Get flight by departure airport id success',
        metadata: { flights, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getFlightByArrivalAirportId = async (
    req: Request<ParamsDictionary, any, getFlightByArrivalAirportIdTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resultParams = getFlightByArrivalAirportIdSchema.params.parse(req.params)
      const resultQuery = getFlightByArrivalAirportIdSchema.query.parse(req.query)

      const { flights, pagination } = await FlightServices.getFlightByArrivalAirportId(
        resultParams.arrivalAirportId,
        resultQuery
      )
      new OK({
        message: 'Get flight by arrival airport id success',
        metadata: { flights, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getListFlights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, order, sortBy } = getListFlightSchema.query.parse(req.query)
      const { flights, pagination } = await FlightServices.getListFlight({ page, limit, order, sortBy })
      new OK({
        message: 'Get list flights successfully',
        metadata: { flights, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  searchFlights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryBody = searchFlightSchema.query.parse(req.query)
      const { flights, pagination } = await FlightServices.searchFlight(queryBody)
      new OK({
        message: 'Search flights successfully',
        metadata: { flights, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  filterFlights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = filterFlightSchema.query.parse(req.query)
      const result = await FlightServices.filterFlight(filters)
      new OK({
        message: 'Filter flights successfully',
        metadata: result
      }).send(res)
    } catch (error) {
      next(error)
    }
  }
}

export default new FlightController()
