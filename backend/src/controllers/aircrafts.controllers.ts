import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK } from '~/responses/success.response'
import AircraftsService from '~/services/aircrafts.services'
import {
  createAircraftTypeBody,
  updateAircraftTypeBody,
  searchAircraftTypeQuery,
  getListAircraftTypeQuery,
  filterAircraftTypeQuery,
  getAircraftByManufacturerTypeQuery,
  getAircraftByModelTypeQuery,
  getAircraftByAircraftCodeTypeParams,
  getAircraftByAirlineIdTypeQuery
} from '~/requestSchemas/aircrafts.request'

class AircraftController {
  createAircraft = async (
    req: Request<ParamsDictionary, any, createAircraftTypeBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const aircraft = await AircraftsService.createAircraft(req.body)
      new Created({
        message: 'Create aircraft success',
        metadata: { aircraft }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  updateAircraft = async (
    req: Request<ParamsDictionary, any, updateAircraftTypeBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const aircraft = await AircraftsService.updateAircraft(req.params.aircraftId, req.body)
      new OK({
        message: 'Update aircraft success',
        metadata: { aircraft }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  deleteAircraft = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const aircraft = await AircraftsService.deleteAircraft(req.params.aircraftId)
      new OK({
        message: 'Delete aircraft success',
        metadata: { aircraft }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  searchAircraft = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { aircrafts, pagination } = await AircraftsService.searchAircraft(req.query as searchAircraftTypeQuery)
      new OK({
        message: 'Search aircraft success',
        metadata: { aircrafts, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAircraftById = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const aircraft = await AircraftsService.getAircraftById(req.params.aircraftId)
      new OK({
        message: 'Get Aircraft By Id success',
        metadata: { aircraft }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAircraftByAircraftCode = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const aircraft = await AircraftsService.getAircraftByAircraftCode(req.params.code)
      new OK({
        message: 'Get Aircraft By AircraftCode success',
        metadata: { aircraft }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAircraftByAirlineId = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { aircrafts, pagination } = await AircraftsService.getAircraftByAirlineId(
        req.query as getAircraftByAirlineIdTypeQuery
      )
      new OK({
        message: 'Get Aircraft By Model success',
        metadata: { aircrafts, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAircraftByModel = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { aircrafts, pagination } = await AircraftsService.getAircraftByModel(
        req.query as getAircraftByModelTypeQuery
      )
      new OK({
        message: 'Get Aircraft By Model success',
        metadata: { aircrafts, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getListAircraft = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { aircrafts, pagination } = await AircraftsService.getListAircraft(req.query as getListAircraftTypeQuery)
      new OK({
        message: 'Get list aircraft success',
        metadata: { aircrafts, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAircraftByManufacturer = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { aircrafts, pagination } = await AircraftsService.getAircraftByManufacturer(
        req.query as getAircraftByManufacturerTypeQuery
      )
      new OK({
        message: 'Get Aircraft By Manufacturer success',
        metadata: { aircrafts, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  filterAircraft = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { aircrafts, pagination } = await AircraftsService.filterAircraft(req.query as filterAircraftTypeQuery)
      new OK({
        message: 'Filter aircraft success',
        metadata: { aircrafts, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }
}

export default new AircraftController()
