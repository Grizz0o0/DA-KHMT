import 'dotenv/config'
import {
  createAirportTypeBody,
  updateAirportTypeBody,
  searchAirportTypeQuery,
  getListAirportTypeQuery,
  filterAirportTypeQuery,
  createAirportSchema,
  updateAirportSchema,
  deleteAirportSchema,
  searchAirportSchema,
  getListAirportSchema,
  filterAirportSchema,
  getAirportByIdSchema,
  getAirportByCodeSchema
} from '~/requestSchemas/airports.request'
import { airportSchema } from '~/models/airports.model'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongoUtils'
import { getInfoData, getSelectData, omitInfoData, unSelectData } from '~/utils/objectUtils'
import { createPagination } from '~/responses/success.response'

class AirportsService {
  static async isAirportExists(name: string) {
    return await databaseService.airports.findOne({ name })
  }

  static async createAirport(payload: createAirportTypeBody) {
    const validatedData = createAirportSchema.body.parse(payload)

    const holderAirport = await databaseService.airports.findOne({ name: validatedData.name })
    if (holderAirport) throw new BadRequestError('Airport already registered')

    const parsedAirport = airportSchema.parse(validatedData)
    const airport = await databaseService.airports.insertOne(parsedAirport)
    if (!airport.insertedId) throw new BadRequestError('Create Airport failed')
    return airport
  }

  static async updateAirport(id: string, payload: updateAirportTypeBody) {
    updateAirportSchema.params.parse({ airportId: id })
    const validatedData = updateAirportSchema.body.parse(payload)

    const existingAirport = await databaseService.airports.findOne({ _id: convertToObjectId(id) })
    if (!existingAirport) {
      throw new BadRequestError('Airport not found')
    }

    const updatedAirport = await databaseService.airports.findOneAndUpdate(
      { _id: convertToObjectId(id) },
      {
        $set: { ...validatedData },
        $currentDate: {
          updatedAt: true
        }
      },
      { upsert: true, returnDocument: 'after' }
    )
    if (!updatedAirport) throw new BadRequestError('Update Airport failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: updatedAirport })
  }

  static async deleteAirport(id: string) {
    const { airportId } = deleteAirportSchema.params.parse({ airportId: id })

    const del = await databaseService.airports.findOneAndDelete({ _id: airportId })
    if (!del) throw new BadRequestError('Delete Airport failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: del })
  }

  static async searchAirport({
    content,
    page = 1,
    limit = 10,
    select = ['name', 'code', 'address', 'city', 'country', 'score']
  }: searchAirportTypeQuery) {
    const validatedQuery = searchAirportSchema.query.parse({
      content,
      page,
      limit,
      select
    })

    if (!validatedQuery.content || validatedQuery.content.trim() === '') {
      return { airports: [], pagination: createPagination(1, 10, 0) }
    }

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)

    const totalItems = await databaseService.airports.countDocuments({
      $text: { $search: validatedQuery.content }
    })

    const airports = await databaseService.airports
      .find(
        { $text: { $search: validatedQuery.content } },
        { projection: { ...getSelectData(validatedQuery.select ?? []), score: { $meta: 'textScore' } } }
      )
      .skip(skip)
      .limit(validatedQuery.limit ?? 10)
      .sort({ score: { $meta: 'textScore' } })
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)

    return { airports, pagination }
  }

  static async getListAirport({
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['name', 'code', 'city', 'country', 'terminal', 'createdAt', 'updatedAt']
  }: getListAirportTypeQuery) {
    const validatedQuery = getListAirportSchema.query.parse({
      limit,
      page,
      order,
      select
    })

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)

    const sortField = 'code'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: validatedQuery.order === 'asc' ? 1 : -1 }

    const projection = getSelectData(validatedQuery.select ?? [])

    const totalItems = await databaseService.airports.countDocuments({})

    const airports = await databaseService.airports
      .find({})
      .sort(sortBy)
      .skip(skip)
      .project(projection)
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)

    return { airports, pagination }
  }

  static async filterAirport({
    country = '',
    city = '',
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['name', 'code', 'address', 'city', 'country']
  }: filterAirportTypeQuery) {
    const validatedQuery = filterAirportSchema.query.parse({
      country,
      city,
      limit,
      page,
      order,
      select
    })

    const query: Record<string, any> = {}
    if (validatedQuery.country) query.country = validatedQuery.country
    if (validatedQuery.city) query.city = validatedQuery.city

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)

    const sortField = 'code'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: validatedQuery.order === 'asc' ? 1 : -1 }

    const totalItems = await databaseService.airports.countDocuments(query)

    const projection = getSelectData(validatedQuery.select ?? [])

    const airports = await databaseService.airports
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .project(projection)
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)

    return { airports, pagination }
  }

  static async getAirportById(id: string) {
    const { airportId } = getAirportByIdSchema.params.parse({ airportId: id })

    const airport = await databaseService.airports.findOne({ _id: airportId })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: airport })
  }

  static async getAirportByCode(code: string) {
    const { code: validatedCode } = getAirportByCodeSchema.params.parse({ code })

    const airport = await databaseService.airports.findOne({ code: validatedCode })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: airport })
  }
}

export default AirportsService
