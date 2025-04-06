import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK } from '~/responses/success.response'
import AirlinesService from '~/services/airlines.services'
import {
  CreateAirlineReqBody,
  GetListAirlineReqBody,
  SearchAirlineReqBody,
  UpdateAirlineReqBody
} from '~/models/requests/airlines.request'

class AirlinesController {
  createAirline = async (
    req: Request<ParamsDictionary, any, CreateAirlineReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new Created({
      message: 'Create airline success',
      metadata: await AirlinesService.createAirline(req.body)
    }).send(res)
  }

  updateAirline = async (
    req: Request<ParamsDictionary, any, UpdateAirlineReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: 'Update airline success',
      metadata: await AirlinesService.updateAirline(req.params.airlineId, req.body)
    }).send(res)
  }

  deleteAirline = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Delete airline success',
      metadata: await AirlinesService.deleteAirline(req.params.airlineId)
    }).send(res)
  }

  searchAirline = async (
    req: Request<ParamsDictionary, any, SearchAirlineReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    const query = {
      limit: Number(req.query.limit) || 10,
      page: Number(req.query.page) || 1,
      content: req.query.content?.toString() || ''
    }
    new Created({
      message: 'Search airline success',
      metadata: await AirlinesService.searchAirline(query)
    }).send(res)
  }

  getListAirline = async (
    req: Request<ParamsDictionary, any, GetListAirlineReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    new Created({
      message: 'Search airline success',
      metadata: await AirlinesService.getListAirline(req.query)
    }).send(res)
  }

  getAirlineByCode = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Get Airline By Code success',
      metadata: await AirlinesService.getAirlineByCode(req.params.airlineCode)
    }).send(res)
  }

  getAirlineById = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    new OK({
      message: 'Get Airline By Id success',
      metadata: await AirlinesService.getAirlineById(req.params.airlineId)
    }).send(res)
  }
}

export default new AirlinesController()
