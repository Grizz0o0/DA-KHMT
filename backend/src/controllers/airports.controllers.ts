import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK } from '~/responses/success.response'
import {
  CreateAirportReqBody,
  FilterAirportReqBody,
  GetListAirportReqBody,
  SearchAirportReqBody,
  UpdateAirportReqBody
} from '~/models/requests/airports.request'
import AirportsService from '~/services/airports.services'

class AirportsController {
  createAirport = async (
    req: Request<ParamsDictionary, any, CreateAirportReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new Created({
      message: 'Create airport success',
      metadata: await AirportsService.createAirport(req.body)
    }).send(res)
  }

  updateAirport = async (
    req: Request<ParamsDictionary, any, UpdateAirportReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: 'Update airport success',
      metadata: await AirportsService.updateAirport(req.params.airportId, req.body)
    }).send(res)
  }

  deleteAirport = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Delete airport success',
      metadata: await AirportsService.deleteAirport(req.params.airportId)
    }).send(res)
  }

  searchAirport = async (
    req: Request<ParamsDictionary, any, SearchAirportReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    const query = {
      limit: Number(req.query.limit) || 10,
      page: Number(req.query.page) || 1,
      content: req.query.content?.toString() || ''
    }
    new OK({
      message: 'Search airport success',
      metadata: await AirportsService.searchAirport(query)
    }).send(res)
  }

  filterAirport = async (
    req: Request<ParamsDictionary, any, FilterAirportReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: 'Filter airport success',
      metadata: await AirportsService.filterAirport(req.query)
    }).send(res)
  }

  getListAirport = async (
    req: Request<ParamsDictionary, any, GetListAirportReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: 'Search airport success',
      metadata: await AirportsService.getListAirport(req.query)
    }).send(res)
  }

  getAirportByCode = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Get Airport By Code success',
      metadata: await AirportsService.getAirportByCode(req.params.airportCode)
    }).send(res)
  }

  getAirportById = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Get Airport By Id success',
      metadata: await AirportsService.getAirportById(req.params.airportId)
    }).send(res)
  }
}

export default new AirportsController()
