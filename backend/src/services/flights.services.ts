import { flightSchema } from '~/models/flights.model'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongoUtils'
import { getSelectData, omitInfoData } from '~/utils/objectUtils'
import { createPagination } from '~/responses/success.response'
import {
  createFlightTypeBody,
  filterFlightTypeQuery,
  getFlightByIdTypeParams,
  getListFlightTypeQuery,
  searchFlightTypeQuery,
  updateFlightTypeBody,
  createFlightSchema,
  updateFlightSchema,
  deleteFlightSchema,
  getFlightByIdSchema,
  filterFlightSchema,
  getListFlightSchema,
  searchFlightSchema,
  getFlightByFlightNumberSchema,
  getFlightByAirlineIdSchema,
  getFlightByAircraftIdSchema,
  getFlightByDepartureAirportIdSchema,
  getFlightByArrivalAirportIdSchema,
  getFlightByAirlineIdTypeQuery,
  getFlightByAircraftIdTypeQuery,
  getFlightByDepartureAirportIdTypeQuery,
  getFlightByArrivalAirportIdTypeQuery
} from '~/requestSchemas/flights.request'
import { ObjectId } from 'mongodb'

class FlightServices {
  static async createFlight(payload: createFlightTypeBody) {
    const validatedData = createFlightSchema.body.parse(payload)

    const holderFlight = await databaseService.flights.findOne({ flightNumber: validatedData.flightNumber })
    if (holderFlight) throw new BadRequestError('Flight already registered')

    const parsedFlight = flightSchema.parse(validatedData)
    const airport = await databaseService.flights.insertOne(parsedFlight)
    if (!airport.insertedId) throw new BadRequestError('Create Flight failed')
    return airport
  }

  static async updateFlight(id: ObjectId, payload: updateFlightTypeBody) {
    const existingFlight = await databaseService.flights.findOne({ _id: id })
    if (!existingFlight) {
      throw new BadRequestError(`Flight with ID ${id} not found`)
    }

    const updatedFlight = await databaseService.flights.findOneAndUpdate(
      { _id: id },
      {
        $set: { ...payload },
        $currentDate: {
          updatedAt: true
        }
      },
      { returnDocument: 'after' }
    )
    if (!updatedFlight) throw new BadRequestError('Update Flight failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: updatedFlight })
  }

  static async deleteFlight(id: ObjectId) {
    const { id: validatedId } = deleteFlightSchema.params.parse({ id })

    const del = await databaseService.flights.findOneAndDelete({ _id: validatedId })
    if (!del) throw new BadRequestError('Delete Flight failed')
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: del })
  }

  static async searchFlight({
    content,
    page = 1,
    limit = 10,
    order = 'asc',
    sortBy = 'departureTime'
  }: searchFlightTypeQuery) {
    const validatedQuery = searchFlightSchema.query.parse({
      content,
      page,
      limit,
      order,
      sortBy
    })

    if (!validatedQuery.content || validatedQuery.content.trim() === '') {
      return { flights: [], pagination: createPagination(1, 10, 0) }
    }

    const skip = (validatedQuery.page - 1) * validatedQuery.limit
    const sortField = validatedQuery.sortBy
    const sortOrder = validatedQuery.order === 'asc' ? 1 : -1

    const totalItems = await databaseService.flights.countDocuments({
      $text: { $search: validatedQuery.content }
    })

    const flights = await databaseService.flights
      .find({ $text: { $search: validatedQuery.content } }, { projection: { score: { $meta: 'textScore' } } })
      .sort({ [sortField]: sortOrder, score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(validatedQuery.limit)
      .toArray()

    const pagination = createPagination(validatedQuery.page, validatedQuery.limit, totalItems)

    return {
      flights: flights.map((flight) => omitInfoData({ fields: ['createAt', 'updateAt'], object: flight })),
      pagination
    }
  }

  static async getListFlight({
    limit = 10,
    page = 1,
    order = 'asc',
    sortBy = 'departureTime'
  }: getListFlightTypeQuery) {
    const validatedQuery = getListFlightSchema.query.parse({
      limit,
      page,
      order,
      sortBy
    })

    const skip = (validatedQuery.page - 1) * validatedQuery.limit
    const sortField = validatedQuery.sortBy
    const sortOrder = validatedQuery.order === 'asc' ? 1 : -1

    const totalItems = await databaseService.flights.countDocuments({})

    const flights = await databaseService.flights
      .find()
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(validatedQuery.limit)
      .toArray()

    const pagination = createPagination(validatedQuery.page, validatedQuery.limit, totalItems)

    return {
      flights: flights.map((flight) => omitInfoData({ fields: ['createAt', 'updateAt'], object: flight })),
      pagination
    }
  }

  static async filterFlight({
    flightNumber,
    airlineId,
    aircraftId,
    departureAirportId,
    arrivalAirportId,
    departureTime,
    arrivalTime,
    duration,
    price,
    availableSeats,
    limit = 10,
    page = 1,
    order = 'asc',
    sortBy = 'departureTime'
  }: filterFlightTypeQuery) {
    const validatedQuery = filterFlightSchema.query.parse({
      flightNumber,
      airlineId,
      aircraftId,
      departureAirportId,
      arrivalAirportId,
      departureTime,
      arrivalTime,
      duration,
      price,
      availableSeats,
      limit,
      page,
      order,
      sortBy
    })

    const filter: Record<string, any> = {}

    if (validatedQuery.flightNumber) filter.flightNumber = validatedQuery.flightNumber
    if (validatedQuery.airlineId) filter.airlineId = validatedQuery.airlineId
    if (validatedQuery.aircraftId) filter.aircraftId = validatedQuery.aircraftId
    if (validatedQuery.departureAirportId) filter.departureAirportId = validatedQuery.departureAirportId
    if (validatedQuery.arrivalAirportId) filter.arrivalAirportId = validatedQuery.arrivalAirportId

    if (validatedQuery.departureTime) {
      const departureDate = new Date(validatedQuery.departureTime)
      filter.departureTime = departureDate
    }
    if (validatedQuery.arrivalTime) {
      const arrivalDate = new Date(validatedQuery.arrivalTime)
      filter.arrivalTime = arrivalDate
    }

    if (validatedQuery.duration) filter.duration = validatedQuery.duration
    if (validatedQuery.price) filter.price = { $lte: validatedQuery.price }
    if (validatedQuery.availableSeats) filter.availableSeats = validatedQuery.availableSeats

    const skip = (validatedQuery.page - 1) * validatedQuery.limit
    const sortField = validatedQuery.sortBy
    const sortOrder = validatedQuery.order === 'asc' ? 1 : -1

    const totalItems = await databaseService.flights.countDocuments(filter)
    const flights = await databaseService.flights
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(validatedQuery.limit)
      .toArray()

    const pagination = createPagination(validatedQuery.page, validatedQuery.limit, totalItems)

    return {
      flights: flights.map((flight) => omitInfoData({ fields: ['createAt', 'updateAt'], object: flight })),
      pagination
    }
  }

  static async getFlightById(id: ObjectId) {
    const { id: validatedId } = getFlightByIdSchema.params.parse({ id })

    const flight = await databaseService.flights.findOne({ _id: validatedId })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: flight })
  }

  static async getFlightByFlightNumber(flightNumber: string) {
    const { flightNumber: validatedFlightNumber } = getFlightByFlightNumberSchema.params.parse({ flightNumber })

    const flight = await databaseService.flights.findOne({ flightNumber: validatedFlightNumber })
    return omitInfoData({ fields: ['createAt', 'updateAt'], object: flight })
  }

  static async getFlightByAirlineId(airlineId: ObjectId, query: getFlightByAirlineIdTypeQuery) {
    const { airlineId: validatedAirlineId } = getFlightByAirlineIdSchema.params.parse({ airlineId })
    const validatedQuery = getFlightByAirlineIdSchema.query.parse(query)

    const skip = (validatedQuery.page - 1) * validatedQuery.limit
    const sortField = validatedQuery.sortBy
    const sortOrder = validatedQuery.order === 'asc' ? 1 : -1

    const totalItems = await databaseService.flights.countDocuments({ airlineId: validatedAirlineId })

    const flights = await databaseService.flights
      .find({ airlineId: validatedAirlineId })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(validatedQuery.limit)
      .toArray()

    const pagination = createPagination(validatedQuery.page, validatedQuery.limit, totalItems)

    return {
      flights: flights.map((flight) => omitInfoData({ fields: ['createAt', 'updateAt'], object: flight })),
      pagination
    }
  }

  static async getFlightByAircraftId(aircraftId: ObjectId, query: getFlightByAircraftIdTypeQuery) {
    const { aircraftId: validatedAircraftId } = getFlightByAircraftIdSchema.params.parse({ aircraftId })
    const validatedQuery = getFlightByAircraftIdSchema.query.parse(query)

    const skip = (validatedQuery.page - 1) * validatedQuery.limit
    const sortField = validatedQuery.sortBy
    const sortOrder = validatedQuery.order === 'asc' ? 1 : -1

    const totalItems = await databaseService.flights.countDocuments({ aircraftId: validatedAircraftId })

    const flights = await databaseService.flights
      .find({ aircraftId: validatedAircraftId })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(validatedQuery.limit)
      .toArray()

    const pagination = createPagination(validatedQuery.page, validatedQuery.limit, totalItems)

    return {
      flights: flights.map((flight) => omitInfoData({ fields: ['createAt', 'updateAt'], object: flight })),
      pagination
    }
  }

  static async getFlightByDepartureAirportId(
    departureAirportId: ObjectId,
    query: getFlightByDepartureAirportIdTypeQuery
  ) {
    const { departureAirportId: validatedDepartureAirportId } = getFlightByDepartureAirportIdSchema.params.parse({
      departureAirportId
    })
    const validatedQuery = getFlightByDepartureAirportIdSchema.query.parse(query)

    const skip = (validatedQuery.page - 1) * validatedQuery.limit
    const sortField = validatedQuery.sortBy
    const sortOrder = validatedQuery.order === 'asc' ? 1 : -1

    const totalItems = await databaseService.flights.countDocuments({ departureAirportId: validatedDepartureAirportId })

    const flights = await databaseService.flights
      .find({ departureAirportId: validatedDepartureAirportId })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(validatedQuery.limit)
      .toArray()

    const pagination = createPagination(validatedQuery.page, validatedQuery.limit, totalItems)

    return {
      flights: flights.map((flight) => omitInfoData({ fields: ['createAt', 'updateAt'], object: flight })),
      pagination
    }
  }

  static async getFlightByArrivalAirportId(arrivalAirportId: ObjectId, query: getFlightByArrivalAirportIdTypeQuery) {
    const { arrivalAirportId: validatedArrivalAirportId } = getFlightByArrivalAirportIdSchema.params.parse({
      arrivalAirportId
    })
    const validatedQuery = getFlightByArrivalAirportIdSchema.query.parse(query)

    const skip = (validatedQuery.page - 1) * validatedQuery.limit
    const sortField = validatedQuery.sortBy
    const sortOrder = validatedQuery.order === 'asc' ? 1 : -1

    const totalItems = await databaseService.flights.countDocuments({ arrivalAirportId: validatedArrivalAirportId })

    const flights = await databaseService.flights
      .find({ arrivalAirportId: validatedArrivalAirportId })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(validatedQuery.limit)
      .toArray()

    const pagination = createPagination(validatedQuery.page, validatedQuery.limit, totalItems)

    return {
      flights: flights.map((flight) => omitInfoData({ fields: ['createAt', 'updateAt'], object: flight })),
      pagination
    }
  }
}

export default FlightServices
