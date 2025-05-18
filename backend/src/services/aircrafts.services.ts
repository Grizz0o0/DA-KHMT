import 'dotenv/config'
import {
  createAircraftTypeBody,
  updateAircraftTypeBody,
  searchAircraftTypeQuery,
  getListAircraftTypeQuery,
  filterAircraftTypeQuery,
  getAircraftByManufacturerTypeQuery,
  getAircraftByModelTypeQuery,
  getAircraftByAirlineIdTypeQuery,
  getAircraftByAirlineIdSchema
} from '~/requestSchemas/aircrafts.request'
import {
  createAircraftSchema,
  updateAircraftSchema,
  searchAircraftSchema,
  getListAircraftSchema,
  filterAircraftSchema,
  deleteAircraftSchema,
  getAircraftByIdSchema,
  getAircraftByModelSchema,
  getAircraftByManufacturerSchema,
  getAircraftByAircraftCodeSchema
} from '~/requestSchemas/aircrafts.request'
import { AircraftType, aircraftSchema } from '~/models/aircrafts.model'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongo.utils'
import { getInfoData, getSelectData, omitInfoData, unSelectData } from '~/utils/object.utils'
import { createPagination } from '~/responses/success.response'
import { ObjectId } from 'mongodb'

class AircraftService {
  static async isAircraftExists(aircraftCode: string) {
    return await databaseService.aircrafts.findOne({ aircraftCode })
  }

  static async createAircraft(payload: createAircraftTypeBody) {
    const validatedData = createAircraftSchema.body.parse(payload)

    const holderAircraft = await databaseService.aircrafts.findOne({ aircraftCode: validatedData.aircraftCode })
    if (holderAircraft) throw new BadRequestError('Aircraft already registered')

    const parsedAircraft = aircraftSchema.parse(validatedData)
    const aircraft = await databaseService.aircrafts.insertOne(parsedAircraft)

    if (!aircraft.insertedId) throw new BadRequestError('Create Aircraft failed')
    return aircraft
  }

  static async updateAircraft(id: string, payload: updateAircraftTypeBody) {
    updateAircraftSchema.params.parse({ aircraftId: id })
    const validatedData = updateAircraftSchema.body.parse(payload)

    const existingAircraft = await databaseService.aircrafts.findOne({ _id: convertToObjectId(id) })
    if (!existingAircraft) {
      throw new BadRequestError('Aircraft not found')
    }

    const updatedAircraft = await databaseService.aircrafts.findOneAndUpdate(
      { _id: convertToObjectId(id) },
      {
        $set: { ...validatedData },
        $currentDate: {
          updatedAt: true
        }
      },
      { upsert: true, returnDocument: 'after' }
    )
    if (!updatedAircraft) throw new BadRequestError('Update Aircraft failed')
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: updatedAircraft })
  }

  static async deleteAircraft(id: string) {
    const { aircraftId } = deleteAircraftSchema.params.parse({ aircraftId: id }) as { aircraftId: ObjectId }

    const del = await databaseService.aircrafts.findOneAndDelete({ _id: aircraftId })
    if (!del) throw new BadRequestError('Delete Aircraft failed')
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: del })
  }

  static async searchAircraft({
    content,
    page = 1,
    limit = 10,
    select = ['model', 'manufacturer', 'seatConfiguration', 'capacity', 'aircraftCode', 'status', 'score']
  }: searchAircraftTypeQuery) {
    const validatedQuery = searchAircraftSchema.query.parse({
      content,
      page,
      limit,
      select
    })
    console.log(validatedQuery)
    if (!validatedQuery.content || validatedQuery.content.trim() === '') {
      return { aircrafts: [], pagination: createPagination(1, 10, 0) }
    }

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)

    const totalItems = await databaseService.aircrafts.countDocuments({
      $text: { $search: validatedQuery.content }
    })

    const aircrafts = await databaseService.aircrafts
      .find(
        { $text: { $search: validatedQuery.content } },
        { projection: { ...getSelectData(validatedQuery.select ?? []), score: { $meta: 'textScore' } } }
      )
      .skip(skip)
      .limit(validatedQuery.limit ?? 10)
      .sort({ score: { $meta: 'textScore' } })
      .toArray()

    // Tạo thông tin phân trang
    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)

    return { aircrafts, pagination }
  }

  static async getListAircraft({
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['model', 'manufacturer', 'airlineId', 'seatConfiguration', 'capacity', 'aircraftCode', 'status']
  }: getListAircraftTypeQuery) {
    const validatedQuery = getListAircraftSchema.query.parse({
      limit,
      page,
      order,
      select
    })

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)

    const sortField = 'aircraftCode'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: validatedQuery.order === 'asc' ? 1 : -1 }

    // Đếm tổng số lượng
    const totalItems = await databaseService.aircrafts.countDocuments({})

    const aircrafts = await databaseService.aircrafts
      .find()
      .sort(sortBy)
      .skip(skip)
      .project(getSelectData(validatedQuery.select ?? []))
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    // Tạo thông tin phân trang
    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)

    return { aircrafts, pagination }
  }

  static async getAircraftByManufacturer({ manufacturer, page = 1, limit = 10 }: getAircraftByManufacturerTypeQuery) {
    const validatedQuery = getAircraftByManufacturerSchema.query.parse({ manufacturer, page, limit })
    console.log(validatedQuery)
    if (!validatedQuery.manufacturer || validatedQuery.manufacturer.trim() === '') {
      return { aircrafts: [], pagination: createPagination(1, 10, 0) }
    }
    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)
    const totalItems = await databaseService.aircrafts.countDocuments({ manufacturer: validatedQuery.manufacturer })

    const aircrafts = await databaseService.aircrafts
      .find({ manufacturer: validatedQuery.manufacturer })
      .skip(skip)
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)
    return {
      aircrafts: aircrafts.map((aircraft) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: aircraft })),
      pagination
    }
  }

  static async getAircraftById(id: string) {
    const { aircraftId } = getAircraftByIdSchema.params.parse({ aircraftId: id })

    const aircraft = await databaseService.aircrafts.findOne({ _id: aircraftId })
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: aircraft })
  }

  static async getAircraftByAirlineId({ airlineId, page = 1, limit = 10 }: getAircraftByAirlineIdTypeQuery) {
    const validatedQuery = getAircraftByAirlineIdSchema.query.parse({ airlineId, page, limit })

    if (!validatedQuery.airlineId) {
      return { aircrafts: [], pagination: createPagination(1, 10, 0) }
    }

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)
    const totalItems = await databaseService.aircrafts.countDocuments({ airlineId: validatedQuery.airlineId })

    const aircrafts = await databaseService.aircrafts
      .find({ airlineId: validatedQuery.airlineId })
      .skip(skip)
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)
    return {
      aircrafts: aircrafts.map((aircraft) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: aircraft })),
      pagination
    }
  }

  static async getAircraftByModel({ model, page = 1, limit = 10 }: getAircraftByModelTypeQuery) {
    const validatedQuery = getAircraftByModelSchema.query.parse({ model, page, limit })

    if (!validatedQuery.model || validatedQuery.model.trim() === '') {
      return { aircrafts: [], pagination: createPagination(1, 10, 0) }
    }

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)
    const totalItems = await databaseService.aircrafts.countDocuments({ model: validatedQuery.model })

    const aircrafts = await databaseService.aircrafts
      .find({ model: validatedQuery.model })
      .skip(skip)
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)
    return {
      aircrafts: aircrafts.map((aircraft) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: aircraft })),
      pagination
    }
  }

  static async getAircraftByAircraftCode(aircraftCode: string) {
    const { code } = getAircraftByAircraftCodeSchema.params.parse({ code: aircraftCode })

    const aircraft = await databaseService.aircrafts.findOne({ aircraftCode: code })
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: aircraft })
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
  }: filterAircraftTypeQuery) {
    const validatedQuery = filterAircraftSchema.query.parse({
      model,
      manufacturer,
      aircraftCode,
      status,
      limit,
      page,
      order,
      select
    })

    const query: Record<string, any> = {}
    if (validatedQuery.model) query.model = validatedQuery.model
    if (validatedQuery.manufacturer) query.manufacturer = validatedQuery.manufacturer
    if (validatedQuery.aircraftCode) query.aircraftCode = validatedQuery.aircraftCode
    if (validatedQuery.status) query.status = validatedQuery.status

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)

    const sortField = 'aircraftCode'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: validatedQuery.order === 'asc' ? 1 : -1 }

    // Đếm tổng số lượng phù hợp với điều kiện
    const totalItems = await databaseService.aircrafts.countDocuments(query)

    const aircrafts = await databaseService.aircrafts
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .project(getSelectData(validatedQuery.select ?? []))
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    // Tạo thông tin phân trang
    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)

    return { aircrafts, pagination }
  }
}

export default AircraftService
