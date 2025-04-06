import 'dotenv/config'
import {
  CreateAirlineReqBody,
  GetListAirlineReqBody,
  SearchAirlineReqBody,
  UpdateAirlineReqBody
} from '~/models/requests/airlines.request'
import { airlineSchema } from '~/models/schemas/airlines.schema'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongoUtils'
import { getInfoData, getSelectData, omitInfoData, unSelectData } from '~/utils/objectUtils'

class AirlinesService {
  static async isAirlineExists(name: string) {
    return await databaseService.airlines.findOne({ name })
  }

  static async createAirline(payload: CreateAirlineReqBody) {
    const holderAirline = await databaseService.airlines.findOne({ name: payload.name })
    if (holderAirline) throw new BadRequestError('Airline already registered')

    const parsedAirline = airlineSchema.parse(payload)
    const airline = await databaseService.airlines.insertOne(parsedAirline)

    if (!airline.insertedId) throw new BadRequestError('Create Airline failed')
    return airline
  }

  static async updateAirline(id: string, payload: UpdateAirlineReqBody) {
    if (!isValidObjectId(id)) {
      throw new BadRequestError('The provided ID is not a valid MongoDB ObjectId. It should be a 24-character hex')
    }
    const updatedAirline = await databaseService.airlines.findOneAndUpdate(
      { _id: convertToObjectId(id) },
      {
        $set: { ...payload },
        $currentDate: {
          updatedAt: true
        }
      },
      { upsert: true, returnDocument: 'after' }
    )
    if (!updatedAirline) throw new BadRequestError('Update Airline failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: updatedAirline })
  }

  static async deleteAirline(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestError('The provided ID is not a valid MongoDB ObjectId. It should be a 24-character hex')
    }
    const del = await databaseService.airlines.findOneAndDelete({ _id: convertToObjectId(id) })
    if (!del) throw new BadRequestError('Update Airline failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: del })
  }

  static async searchAirline({
    content,
    page = 1,
    limit = 10,
    select = ['name', 'code', 'logo', 'description', 'score']
  }: SearchAirlineReqBody) {
    const skip = (page - 1) * limit
    const airlines = await databaseService.airlines
      .find(
        { $text: { $search: content } },
        { projection: { ...getSelectData(select), score: { $meta: 'textScore' } } }
      )
      .skip(skip)
      .limit(limit)
      .sort({ score: { $meta: 'textScore' } })
      .toArray()
    return airlines
  }

  static async getListAirline({
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['name', 'code', 'logo', 'description']
  }: GetListAirlineReqBody) {
    const skip = (page - 1) * limit
    const sortBy: { [key: string]: 1 | -1 } = order === 'asc' ? { _id: 1 } : { _id: -1 }
    const products = await databaseService.airlines
      .find()
      .sort(sortBy)
      .skip(skip)
      .project(getSelectData(select as []))
      .limit(+limit)
      .toArray()
    return products
  }

  static async getAirlineById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestError('The provided ID is not a valid MongoDB ObjectId. It should be a 24-character hex')
    }
    const airline = await databaseService.airlines.findOne({ _id: convertToObjectId(id) })
    console.log(airline)
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: airline })
  }

  static async getAirlineByCode(code: string) {
    const airline = await databaseService.airlines.findOne({ code: code.toUpperCase() })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: airline })
  }
}

export default AirlinesService
