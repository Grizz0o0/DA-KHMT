import 'dotenv/config'
import {
  CreateAirportReqBody,
  FilterAirportReqBody,
  GetListAirportReqBody,
  SearchAirportReqBody,
  UpdateAirportReqBody
} from '~/models/requests/airports.request'
import { airportSchema } from '~/models/schemas/airports.schema'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongoUtils'
import { getInfoData, getSelectData, omitInfoData, unSelectData } from '~/utils/objectUtils'

class AirportsService {
  static async isAirportExists(name: string) {
    return await databaseService.airports.findOne({ name })
  }

  static async createAirport(payload: CreateAirportReqBody) {
    const holderAirport = await databaseService.airports.findOne({ name: payload.name })
    if (holderAirport) throw new BadRequestError('Airport already registered')

    const parsedAirport = airportSchema.parse(payload)
    const airport = await databaseService.airports.insertOne(parsedAirport)
    if (!airport.insertedId) throw new BadRequestError('Create Airport failed')
    return airport
  }

  static async updateAirport(id: string, payload: UpdateAirportReqBody) {
    const updatedAirport = await databaseService.airports.findOneAndUpdate(
      { _id: convertToObjectId(id) },
      {
        $set: { ...payload },
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
    const del = await databaseService.airports.findOneAndDelete({ _id: convertToObjectId(id) })
    if (!del) throw new BadRequestError('Update Airport failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: del })
  }

  static async searchAirport({
    content,
    page = 1,
    limit = 10,
    select = ['name', 'code', 'address', 'city', 'country', 'score']
  }: SearchAirportReqBody) {
    const skip = (page - 1) * limit
    const airports = await databaseService.airports
      .find(
        { $text: { $search: content } },
        { projection: { ...getSelectData(select), score: { $meta: 'textScore' } } }
      )
      .skip(skip)
      .limit(limit)
      .sort({ score: { $meta: 'textScore' } })
      .toArray()
    return airports
  }

  static async getListAirport({
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['name', 'code', 'address', 'city', 'country']
  }: GetListAirportReqBody) {
    const skip = (page - 1) * limit
    const sortBy: { [key: string]: 1 | -1 } = order === 'asc' ? { _id: 1 } : { _id: -1 }
    const airports = await databaseService.airports
      .find()
      .sort(sortBy)
      .skip(skip)
      .project(getSelectData(select as []))
      .limit(+limit)
      .toArray()
    return airports
  }

  static async filterAirport({
    country = '',
    city = '',
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['name', 'code', 'address', 'city', 'country']
  }: FilterAirportReqBody) {
    const query = {} as any
    if (country) query.country = country
    if (city) query.city = city
    const skip = (page - 1) * limit
    const sortBy: { [key: string]: 1 | -1 } = order === 'asc' ? { _id: 1 } : { _id: -1 }
    const airports = await databaseService.airports
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .project(getSelectData(select as []))
      .limit(+limit)
      .toArray()
    return airports
  }

  static async getAirportById(id: string) {
    const airport = await databaseService.airports.findOne({ _id: convertToObjectId(id) })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: airport })
  }

  static async getAirportByCode(code: string) {
    const airport = await databaseService.airports.findOne({ code: code.toUpperCase() })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: airport })
  }
}

export default AirportsService
