import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Created, OK, PartialContent } from '~/responses/success.response'
import {
  createAirportTypeBody,
  updateAirportTypeBody,
  searchAirportTypeQuery,
  getListAirportTypeQuery,
  filterAirportTypeQuery
} from '~/requestSchemas/airports.request'
import AirportsService from '~/services/airports.services'

class AirportsController {
  createAirport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newAirport = await AirportsService.createAirport(req.body)
      new Created({
        message: 'Create airport success',
        metadata: { airport: newAirport }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  updateAirport = async (
    req: Request<ParamsDictionary, any, updateAirportTypeBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updatedAirport = await AirportsService.updateAirport(req.params.airportId, req.body)
      new OK({
        message: 'Update airport success',
        metadata: { airport: updatedAirport }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  deleteAirport = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const deletedAirport = await AirportsService.deleteAirport(req.params.airportId)
      new OK({
        message: 'Delete airport success',
        metadata: { airport: deletedAirport }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  searchAirport = async (
    req: Request<ParamsDictionary, any, searchAirportTypeQuery>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = {
        limit: Number(req.query.limit) || 10,
        page: Number(req.query.page) || 1,
        content: req.query.content?.toString() || '',
        select: req.query?.select as string[]
      }
      const { airports, pagination } = await AirportsService.searchAirport(query)
      new OK({
        message: 'Search airport success',
        metadata: { airports },
        pagination
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  filterAirport = async (
    req: Request<ParamsDictionary, any, filterAirportTypeQuery>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { airports, pagination } = await AirportsService.filterAirport({
        country: req.query.country as string,
        city: req.query.city as string,
        limit: req.query?.limit ? Number(req.query.limit) : undefined,
        page: req.query?.page ? Number(req.query.page) : undefined,
        order: req.query?.order as string,
        select: req.query?.select as string[]
      })

      new OK({
        message: 'Filter airport success',
        metadata: { airports },
        pagination
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getListAirport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { airports, pagination } = await AirportsService.getListAirport({
        limit: req.query?.limit ? Number(req.query.limit) : undefined,
        page: req.query?.page ? Number(req.query.page) : undefined,
        order: req.query?.order as string,
        select: req.query?.select as string[]
      })

      new OK({
        message: 'Get list airports success',
        metadata: { airports },
        pagination
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAirportByCode = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const airport = await AirportsService.getAirportByCode(req.params.code)
      new OK({
        message: 'Get Airport By Code success',
        metadata: { airport }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }

  getAirportById = async (req: Request<ParamsDictionary, any, any>, res: Response, next: NextFunction) => {
    try {
      const airport = await AirportsService.getAirportById(req.params.airportId)
      new OK({
        message: 'Get Airport By Id success',
        metadata: { airport }
      }).send(res)
    } catch (error) {
      next(error)
    }
  }
}

export default new AirportsController()
