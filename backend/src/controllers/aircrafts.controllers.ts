import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK } from '~/responses/success.response'
import AircraftsService from '~/services/aircrafts.services'
import {
  CreateAircraftReqBody,
  FilterAircraft,
  GetListAircraftReqBody,
  SearchAircraftReqBody,
  UpdateAircraftReqBody
} from '~/models/requests/aircrafts.request'

class AircraftController {
  createAircraft = async (
    req: Request<ParamsDictionary, any, CreateAircraftReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new Created({
      message: 'Create aircraft success',
      metadata: await AircraftsService.createAircraft(req.body)
    }).send(res)
  }

  updateAircraft = async (
    req: Request<ParamsDictionary, any, UpdateAircraftReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: 'Update aircraft success',
      metadata: await AircraftsService.updateAircraft(req.params.aircraftId, req.body as UpdateAircraftReqBody)
    }).send(res)
  }

  deleteAircraft = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Delete aircraft success',
      metadata: await AircraftsService.deleteAircraft(req.params.aircraftId)
    }).send(res)
  }

  searchAircraft = async (
    req: Request<ParamsDictionary, any, SearchAircraftReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    const query = {
      limit: Number(req.query.limit) || 10,
      page: Number(req.query.page) || 1,
      content: req.query.content?.toString() || ''
    }
    new Created({
      message: 'Search aircraft success',
      metadata: await AircraftsService.searchAircraft(query)
    }).send(res)
  }

  getListAircraft = async (
    req: Request<ParamsDictionary, any, GetListAircraftReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new Created({
      message: 'Get list aircraft success',
      metadata: await AircraftsService.getListAircraft(req.query)
    }).send(res)
  }

  getAircraftById = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Get Aircraft By Id success',
      metadata: await AircraftsService.getAircraftById(req.params.aircraftId)
    }).send(res)
  }

  getAircraftByAircraftCode = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Get Aircraft By AircraftCode success',
      metadata: await AircraftsService.getAircraftByAircraftCode(req.params.code)
    }).send(res)
  }

  getAircraftByModel = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Get Aircraft By Model success',
      metadata: await AircraftsService.getAircraftByModel(req.params.model)
    }).send(res)
  }

  getAircraftByManufacturer = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Get Aircraft By Manufacturer success',
      metadata: await AircraftsService.getAircraftByManufacturer(req.params.manufacturer)
    }).send(res)
  }

  filterAircraft = async (req: Request<ParamsDictionary, any, FilterAircraft>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Get Aircraft By Manufacturer success',
      metadata: await AircraftsService.filterAircraft(req.query)
    }).send(res)
  }
}

export default new AircraftController()
