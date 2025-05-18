import { flightSchema } from '~/models/flights.model'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongo.utils'
import { getSelectData, omitInfoData } from '~/utils/object.utils'
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
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: updatedFlight })
  }

  static async deleteFlight(id: ObjectId) {
    const { id: validatedId } = deleteFlightSchema.params.parse({ id })

    const del = await databaseService.flights.findOneAndUpdate({ _id: validatedId }, { $set: { isActive: false } })
    if (!del) throw new BadRequestError('Delete Flight failed')
    return del
  }

  static async searchFlight({
    departureAirport,
    arrivalAirport,
    departureTime,
    arrivalTime,
    passengerCount,
    page = 1,
    limit = 10,
    order = 'asc',
    sortBy = 'departureTime'
  }: searchFlightTypeQuery) {
    const skip = (page - 1) * limit
    const sortField = sortBy
    const sortOrder = order === 'asc' ? 1 : -1

    const departureAirportId = await databaseService.airports.findOne({ code: departureAirport })
    const arrivalAirportId = await databaseService.airports.findOne({ code: arrivalAirport })

    // Tạo filter cho chuyến bay đi
    const departureFilter = {
      departureAirportId: departureAirportId?._id,
      arrivalAirportId: arrivalAirportId?._id,
      departureTime: {
        $gte: new Date(departureTime),
        $lt: new Date(new Date(departureTime).setDate(new Date(departureTime).getDate() + 1))
      },
      availableSeats: { $gte: passengerCount }
    }

    let returnFlights: any[] = []
    if (arrivalTime) {
      const returnFilter = {
        departureAirportId: arrivalAirportId?._id,
        arrivalAirportId: departureAirportId?._id,
        departureTime: {
          $gte: new Date(arrivalTime),
          $lt: new Date(new Date(arrivalTime).setDate(new Date(arrivalTime).getDate() + 1))
        },
        availableSeats: { $gte: passengerCount }
      }

      returnFlights = await databaseService.flights
        .find(returnFilter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray()
    }

    const departureFlights = await databaseService.flights
      .find(departureFilter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray()

    const totalItems = await databaseService.flights.countDocuments(departureFilter)

    const pagination = createPagination(page, limit, totalItems)

    return {
      flights: [...departureFlights, ...returnFlights].map((flight) =>
        omitInfoData({
          fields: ['createdAt', 'updatedAt'],
          object: flight
        })
      ),
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

    const totalItems = await databaseService.flights.countDocuments({ isActive: { $ne: false } })

    const flights = await databaseService.flights
      .find({ isActive: { $ne: false } })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(validatedQuery.limit)
      .toArray()

    const pagination = createPagination(validatedQuery.page, validatedQuery.limit, totalItems)
    return {
      flights: await this.populateFlights(flights),
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
      flights: flights.map((flight) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: flight })),
      pagination
    }
  }

  static async getFlightById(id: ObjectId) {
    const { id: validatedId } = getFlightByIdSchema.params.parse({ id })

    const flight = await databaseService.flights.findOne({ _id: validatedId })
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: flight })
  }

  static async getFlightByFlightNumber(flightNumber: string) {
    const { flightNumber: validatedFlightNumber } = getFlightByFlightNumberSchema.params.parse({ flightNumber })

    const flight = await databaseService.flights.findOne({ flightNumber: validatedFlightNumber })
    return omitInfoData({ fields: ['createdAt', 'updatedAt'], object: flight })
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
      flights: flights.map((flight) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: flight })),
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
      flights: flights.map((flight) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: flight })),
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
      flights: flights.map((flight) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: flight })),
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
      flights: flights.map((flight) => omitInfoData({ fields: ['createdAt', 'updatedAt'], object: flight })),
      pagination
    }
  }

  static async populateFlights(flights: any[]) {
    const airlineIds = [...new Set(flights.map((f) => f.airlineId.toString()))]
    const aircraftIds = [...new Set(flights.map((f) => f.aircraftId.toString()))]
    const airportIds = [
      ...new Set(flights.flatMap((f) => [f.departureAirportId.toString(), f.arrivalAirportId.toString()]))
    ]

    const [airlines, airports, aircrafts] = await Promise.all([
      databaseService.airlines.find({ _id: { $in: airlineIds.map(convertToObjectId) } }).toArray(),
      databaseService.airports.find({ _id: { $in: airportIds.map(convertToObjectId) } }).toArray(),
      databaseService.aircrafts.find({ _id: { $in: aircraftIds.map(convertToObjectId) } }).toArray()
    ])

    const airlineMap = Object.fromEntries(airlines.map((a) => [a._id.toString(), a]))
    const airportMap = Object.fromEntries(airports.map((a) => [a._id.toString(), a]))
    const aircraftMap = Object.fromEntries(aircrafts.map((a) => [a._id.toString(), a]))

    return flights.map((flight) => {
      const airline = airlineMap[flight.airlineId.toString()]
      const departureAirport = airportMap[flight.departureAirportId.toString()]
      const arrivalAirport = airportMap[flight.arrivalAirportId.toString()]
      const aircraft = aircraftMap[flight.aircraftId.toString()]

      return {
        _id: flight._id,
        flightNumber: flight.flightNumber,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        price: flight.price,
        availableSeats: flight.availableSeats,
        isActive: flight.isActive,
        airline: airline
          ? {
              _id: airline._id,
              name: airline.name,
              code: airline.code
            }
          : null,
        aircraft: aircraft
          ? {
              _id: aircraft._id,
              model: aircraft.model,
              manufacturer: aircraft.manufacturer,
              aircraftCode: aircraft.aircraftCode,
              seatConfiguration: aircraft.seatConfiguration,
              capacity: aircraft.capacity,
              status: aircraft.status
            }
          : null,
        departureAirport: departureAirport
          ? {
              _id: departureAirport._id,
              name: departureAirport.name,
              code: departureAirport.code,
              city: departureAirport.city
            }
          : null,
        arrivalAirport: arrivalAirport
          ? {
              _id: arrivalAirport._id,
              name: arrivalAirport.name,
              code: arrivalAirport.code,
              city: arrivalAirport.city
            }
          : null
      }
    })
  }
}

export default FlightServices
