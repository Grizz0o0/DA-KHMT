import 'dotenv/config'
import {
  CreateAircraftReqBody,
  UpdateAircraftReqBody,
  SearchAircraftReqBody,
  GetListAircraftReqBody,
  FilterAircraft
} from '~/models/requests/aircrafts.request'
import { AircraftType, aircraftSchema } from '~/models/schemas/aircrafts.schema'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongoUtils'
import { getInfoData, getSelectData, omitInfoData, unSelectData } from '~/utils/objectUtils'

class AircraftService {
  static async isAircraftExists(name: string) {
    return await databaseService.aircrafts.findOne({ name })
  }

  static async createAircraft(payload: CreateAircraftReqBody) {
    const holderAircraft = await databaseService.aircrafts.findOne({ aircraftCode: payload.aircraftCode })
    if (holderAircraft) throw new BadRequestError('Aircraft already registered')

    const parsedAircraft = aircraftSchema.parse({ ...payload, airlineId: convertToObjectId(payload.airlineId) })
    console.log(parsedAircraft)
    const aircraft = await databaseService.aircrafts.insertOne(parsedAircraft)

    if (!aircraft.insertedId) throw new BadRequestError('Create Aircraft failed')
    return aircraft
  }

  static async updateAircraft(id: string, payload: UpdateAircraftReqBody) {
    if (!isValidObjectId(id)) {
      throw new BadRequestError('The provided ID is not a valid MongoDB ObjectId. It should be a 24-character hex')
    }
    const updatedAircraft = await databaseService.aircrafts.findOneAndUpdate(
      { _id: convertToObjectId(id) },
      {
        $set: { ...payload },
        $currentDate: {
          updatedAt: true
        }
      },
      { upsert: true, returnDocument: 'after' }
    )
    if (!updatedAircraft) throw new BadRequestError('Update Aircraft failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: updatedAircraft })
  }

  static async deleteAircraft(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestError('The provided ID is not a valid MongoDB ObjectId. It should be a 24-character hex')
    }
    const del = await databaseService.aircrafts.findOneAndDelete({ _id: convertToObjectId(id) })
    if (!del) throw new BadRequestError('Update Aircraft failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: del })
  }

  static async searchAircraft({
    content,
    page = 1,
    limit = 10,
    select = ['model', 'manufacturer', 'seatConfiguration', 'capacity', 'aircraftCode', 'status', 'score']
  }: SearchAircraftReqBody) {
    const skip = (page - 1) * limit
    const aircrafts = await databaseService.aircrafts
      .find(
        { $text: { $search: content } },
        { projection: { ...getSelectData(select), score: { $meta: 'textScore' } } }
      )
      .skip(skip)
      .limit(limit)
      .sort({ score: { $meta: 'textScore' } })
      .toArray()
    return aircrafts
  }

  static async getListAircraft({
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['model', 'manufacturer', 'seatConfiguration', 'capacity', 'aircraftCode', 'status']
  }: GetListAircraftReqBody) {
    const skip = (page - 1) * limit
    const sortBy: { [key: string]: 1 | -1 } = order === 'asc' ? { _id: 1 } : { _id: -1 }
    const products = await databaseService.aircrafts
      .find()
      .sort(sortBy)
      .skip(skip)
      .project(getSelectData(select as []))
      .limit(+limit)
      .toArray()
    return products
  }

  static async filterAircraft({
    model,
    manufacturer,
    aircraftCode,
    status,
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['model', 'manufacturer', 'seatConfiguration', 'capacity', 'aircraftCode', 'status']
  }: FilterAircraft) {
    const query = {} as any
    if (model) query.model = model
    if (manufacturer) query.manufacturer = manufacturer
    if (aircraftCode) query.aircraftCode = aircraftCode
    if (status) query.status = status
    const skip = (page - 1) * limit
    const sortBy: { [key: string]: 1 | -1 } = order === 'asc' ? { _id: 1 } : { _id: -1 }
    const products = await databaseService.aircrafts
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .project(getSelectData(select as []))
      .limit(+limit)
      .toArray()
    return products
  }

  static async getAircraftById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestError('The provided ID is not a valid MongoDB ObjectId. It should be a 24-character hex')
    }
    const aircraft = await databaseService.aircrafts.findOne({ _id: convertToObjectId(id) })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: aircraft })
  }

  static async getAircraftByModel(model: string) {
    const aircraft = await databaseService.aircrafts.findOne({ model })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: aircraft })
  }

  static async getAircraftByManufacturer(manufacturer: string) {
    const aircraft = await databaseService.aircrafts.findOne({ manufacturer })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: aircraft })
  }

  static async getAircraftByAircraftCode(aircraftCode: string) {
    const aircraft = await databaseService.aircrafts.findOne({ aircraftCode })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: aircraft })
  }
}

export default AircraftService
