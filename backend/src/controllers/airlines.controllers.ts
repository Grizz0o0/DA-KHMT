import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK } from '~/responses/success.response'
import AirlinesService from '~/services/airlines.services'
import {
  createAirlineTypeBody,
  updateAirlineTypeBody,
  searchAirlineTypeQuery,
  getListAirlineTypeQuery,
  getAirlineByIdTypeParams,
  getAirlineByCodeTypeParams
} from '~/requestSchemas/airlines.request'

class AirlinesController {
  createAirline = async (
    req: Request<ParamsDictionary, any, createAirlineTypeBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const airline = await AirlinesService.createAirline(req.body)
      new Created({
        message: 'Create airline success',
        metadata: { airline }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  updateAirline = async (
    req: Request<ParamsDictionary, any, updateAirlineTypeBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const airline = await AirlinesService.updateAirline(req.params.airlineId, req.body)
      new OK({
        message: 'Update airline success',
        metadata: { airline }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  deleteAirline = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const airline = await AirlinesService.deleteAirline(req.params.airlineId)
      new OK({
        message: 'Delete airline success',
        metadata: { airline }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  searchAirline = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { airlines, pagination } = await AirlinesService.searchAirline(req.query as searchAirlineTypeQuery)
      new OK({
        message: 'Search airline success',
        metadata: { airlines, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getListAirline = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const { airlines, pagination } = await AirlinesService.getListAirline(req.query as getListAirlineTypeQuery)
      new OK({
        message: 'Get list airline success',
        metadata: { airlines, pagination }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAirlineByCode = async (
    req: Request<ParamsDictionary, any, getAirlineByCodeTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const airline = await AirlinesService.getAirlineByCode(req.params.airlineCode)
      new OK({
        message: 'Get Airline By Code success',
        metadata: { airline }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAirlineById = async (
    req: Request<ParamsDictionary, any, getAirlineByIdTypeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const airline = await AirlinesService.getAirlineById(req.params.airlineId)
      new OK({
        message: 'Get Airline By Id success',
        metadata: { airline }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }
}

export default new AirlinesController()
