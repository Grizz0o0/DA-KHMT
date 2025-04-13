import 'dotenv/config'
import {
  createAirlineTypeBody,
  updateAirlineTypeBody,
  getAirlineByCodeTypeParams,
  getAirlineByIdTypeParams,
  searchAirlineTypeQuery,
  getListAirlineTypeQuery
} from '~/requestSchemas/airlines.request'
import {
  createAirlineSchema,
  updateAirlineSchema,
  deleteAirlineSchema,
  searchAirlineSchema,
  getListAirlineSchema,
  getAirlineByIdSchema,
  getAirlineByCodeSchema
} from '~/requestSchemas/airlines.request'
import { airlineSchema } from '~/models/airlines.model'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongoUtils'
import { getInfoData, getSelectData, omitInfoData, unSelectData } from '~/utils/objectUtils'
import { createPagination } from '~/responses/success.response'

class AirlinesService {
  static async isAirlineExists(code: string) {
    return await databaseService.airlines.findOne({ code })
  }

  static async createAirline(payload: createAirlineTypeBody) {
    try {
      // Validate dữ liệu đầu vào theo schema
      const parseResult = await createAirlineSchema.body.safeParseAsync(payload)
      if (!parseResult.success) {
        throw new BadRequestError('Invalid airline data: ' + JSON.stringify(parseResult.error.flatten().fieldErrors))
      }
      const validatedData = parseResult.data

      // Kiểm tra code đã tồn tại chưa
      const existingAirline = await databaseService.airlines.findOne({ code: validatedData.code })
      if (existingAirline) {
        throw new BadRequestError(`Airline with code ${validatedData.code} already exists`)
      }

      // Kiểm tra tên đã tồn tại chưa
      const existingName = await databaseService.airlines.findOne({ name: validatedData.name })
      if (existingName) {
        throw new BadRequestError(`Airline with name ${validatedData.name} already exists`)
      }

      // Parse và chuẩn hóa dữ liệu
      const parsedAirline = airlineSchema.parse(validatedData)

      // Thêm vào database
      const airline = await databaseService.airlines.insertOne(parsedAirline)
      if (!airline.insertedId) {
        throw new BadRequestError('Failed to create airline')
      }

      // Trả về airline vừa tạo
      const newAirline = await databaseService.airlines.findOne({ _id: airline.insertedId })
      return newAirline
    } catch (error) {
      // Re-throw lỗi validation
      if (error instanceof BadRequestError) {
        throw error
      }
      // Log và throw lỗi chung
      console.error('Create airline error:', error)
      throw new BadRequestError('Create Airline failed')
    }
  }

  static async updateAirline(id: string, payload: updateAirlineTypeBody) {
    updateAirlineSchema.params.parse({ airlineId: id })
    const validatedData = updateAirlineSchema.body.parse(payload)

    const existingAirline = await databaseService.airlines.findOne({ _id: convertToObjectId(id) })
    if (!existingAirline) {
      throw new BadRequestError('Airline not found')
    }

    const updatedAirline = await databaseService.airlines.findOneAndUpdate(
      { _id: convertToObjectId(id) },
      {
        $set: { ...validatedData },
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
    const { airlineId } = deleteAirlineSchema.params.parse({ airlineId: id })

    const del = await databaseService.airlines.findOneAndDelete({ _id: airlineId })
    if (!del) throw new BadRequestError('Delete Airline failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: del })
  }

  static async searchAirline({
    content,
    page = 1,
    limit = 10,
    select = ['name', 'code', 'logo', 'description']
  }: searchAirlineTypeQuery) {
    const validatedQuery = searchAirlineSchema.query.parse({
      content,
      page,
      limit,
      select
    })

    if (!validatedQuery.content || validatedQuery.content.trim() === '') {
      return { airlines: [], pagination: createPagination(1, 10, 0) }
    }

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)
    const totalItems = await databaseService.airlines.countDocuments({
      $text: { $search: validatedQuery.content }
    })

    const airlines = await databaseService.airlines
      .find(
        { $text: { $search: validatedQuery.content } },
        { projection: { ...getSelectData(validatedQuery.select ?? []), score: { $meta: 'textScore' } } }
      )
      .skip(skip)
      .limit(validatedQuery.limit ?? 10)
      .sort({ score: { $meta: 'textScore' } })
      .toArray()

    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)
    return { airlines, pagination }
  }

  static async getListAirline({
    limit = 10,
    page = 1,
    order = 'asc',
    select = ['name', 'code', 'logo', 'description']
  }: getListAirlineTypeQuery) {
    const validatedQuery = getListAirlineSchema.query.parse({
      limit,
      page,
      order,
      select
    })

    const skip = ((validatedQuery.page ?? 1) - 1) * (validatedQuery.limit ?? 10)

    const sortField = 'code'
    const sortBy: { [key: string]: 1 | -1 } = { [sortField]: validatedQuery.order === 'asc' ? 1 : -1 }
    const totalItems = await databaseService.airlines.countDocuments({})
    const pagination = createPagination(validatedQuery.page ?? 1, validatedQuery.limit ?? 10, totalItems)

    const airlines = await databaseService.airlines
      .find()
      .sort(sortBy)
      .skip(skip)
      .project(getSelectData(validatedQuery.select ?? []))
      .limit(validatedQuery.limit ?? 10)
      .toArray()

    return { airlines, pagination }
  }

  static async getAirlineById(id: string) {
    const { airlineId } = getAirlineByIdSchema.params.parse({ airlineId: id })

    const airline = await databaseService.airlines.findOne({ _id: airlineId })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: airline })
  }

  static async getAirlineByCode(code: string) {
    const { airlineCode } = getAirlineByCodeSchema.params.parse({ airlineCode: code })

    const airline = await databaseService.airlines.findOne({ code: airlineCode })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: airline })
  }
}

export default AirlinesService
