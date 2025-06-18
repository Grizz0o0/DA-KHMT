import { flightSchema } from '~/models/flights.model'
import { BadRequestError } from '~/responses/error.response'
import databaseService from '~/services/database.services'
import { convertToObjectId, isValidObjectId } from '~/utils/mongo.utils'
import { deepCleanUndefined, getSelectData, omitInfoData } from '~/utils/object.utils'
import { createPagination } from '~/responses/success.response'
import { startOfDay, endOfDay } from 'date-fns'
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
import { buildFareOptionsFilter, filterFareOptionsBackend } from '~/helper/fareOptions'

class FlightServices {
  static async createFlight(payload: createFlightTypeBody) {
    const existingFlight = await databaseService.flights.findOne({ flightNumber: payload.flightNumber })
    if (existingFlight) throw new BadRequestError('Flight already registered')

    const aircraft = await databaseService.aircrafts.findOne({ _id: payload.aircraftId })
    if (!aircraft) throw new BadRequestError('Máy bay không tồn tại')

    // Kiểm tra hạng ghế có hợp lệ
    const invalidClass = payload.fareOptions.find((fare) => !aircraft.seatConfiguration?.[fare.class])
    if (invalidClass) throw new BadRequestError(`Hạng ghế ${invalidClass.class} không tồn tại trong máy bay được chọn`)

    // So sánh số ghế với tổng số ghế từ fareOptions
    const totalSeats = payload.fareOptions.reduce((sum, option) => sum + (option.availableSeats ?? 0), 0)
    if (totalSeats > aircraft.capacity)
      throw new BadRequestError(`Tổng số ghế vượt quá sức chứa của máy bay (${aircraft.capacity})`)

    const parsedFlight = flightSchema.parse(payload)
    const flight = await databaseService.flights.insertOne(parsedFlight)
    if (!flight.insertedId) throw new BadRequestError('Create Flight failed')
    return flight
  }

  static async updateFlight(id: ObjectId, payload: updateFlightTypeBody) {
    const existingFlight = await databaseService.flights.findOne({ _id: id })
    if (!existingFlight) throw new BadRequestError(`Flight with ID ${id} not found`)

    if (payload.fareOptions) {
      const totalSeats = payload.fareOptions.reduce((sum, option) => sum + option.availableSeats, 0)

      const aircraftId = payload.aircraftId ?? existingFlight.aircraftId
      const aircraft = await databaseService.aircrafts.findOne({ _id: aircraftId })
      if (!aircraft) throw new BadRequestError('Máy bay không tồn tại')

      if (totalSeats > aircraft.capacity)
        throw new BadRequestError(`Tổng số ghế vượt quá sức chứa của máy bay (${aircraft.capacity})`)

      const invalidClass = payload.fareOptions.find((fare) => !aircraft?.seatConfiguration?.[fare.class])
      if (invalidClass)
        throw new BadRequestError(`Hạng ghế ${invalidClass.class} không tồn tại trong máy bay được chọn`)
    }

    const cleanedPayload = deepCleanUndefined(payload)

    const updatedFlight = await databaseService.flights.findOneAndUpdate(
      { _id: id },
      {
        $set: cleanedPayload,
        $currentDate: { updatedAt: true }
      },
      { returnDocument: 'after' }
    )

    if (!updatedFlight) throw new BadRequestError('Update Flight failed')

    return omitInfoData({
      fields: ['createdAt', 'updatedAt'],
      object: updatedFlight
    })
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
    const sortOrder = order === 'asc' ? 1 : -1
    const sortField = sortBy

    const [departureAirportDoc, arrivalAirportDoc] = await Promise.all([
      departureAirport ? databaseService.airports.findOne({ code: departureAirport }) : null,
      arrivalAirport ? databaseService.airports.findOne({ code: arrivalAirport }) : null
    ])
    const buildFilter = ({ fromId, toId, time }: { fromId?: ObjectId; toId?: ObjectId; time?: Date }) => {
      const filter: any = {
        isActive: { $ne: false },
        fareOptions: {
          $elemMatch: {
            availableSeats: { $gte: passengerCount }
          }
        }
      }

      if (fromId) filter.departureAirportId = fromId
      if (toId) filter.arrivalAirportId = toId
      if (time) {
        const start = new Date(time)
        const end = new Date(time)
        end.setDate(end.getDate() + 1)
        filter.departureTime = { $gte: start, $lt: end }
      }

      return filter
    }

    const filters = []

    // Chuyến đi
    if (departureTime) {
      filters.push(
        buildFilter({
          fromId: departureAirportDoc?._id,
          toId: arrivalAirportDoc?._id,
          time: new Date(departureTime)
        })
      )
    }
    // Chuyến về (nếu có arrivalTime)
    if (arrivalTime) {
      filters.push(
        buildFilter({
          fromId: arrivalAirportDoc?._id,
          toId: departureAirportDoc?._id,
          time: new Date(arrivalTime)
        })
      )
    }

    const queries = await Promise.all(
      filters.map((filter) =>
        databaseService.flights
          .find(filter)
          .sort({ [sortField]: sortOrder })
          .skip(skip)
          .limit(limit)
          .toArray()
      )
    )

    const results = queries.flat()
    const totalItems = results.length
    const pagination = createPagination(page, limit, totalItems)
    if (results.length === 0) throw new BadRequestError('Không tìm thấy chuyến bay phù hợp')
    const populatedFlights = await this.populateFlights(results)

    return {
      flights: populatedFlights,
      pagination
    }
  }

  static async filterFlight(query: filterFlightTypeQuery) {
    const validatedQuery = filterFlightSchema.query.parse(query)

    const {
      flightNumber,
      airlineIds: rawAirlineIds,
      departureAirportId,
      arrivalAirportId,
      departureAirportCode,
      arrivalAirportCode,
      departureTime,
      returnTime,
      duration,
      class: fareClass,
      minPrice,
      maxPrice,
      minAvailableSeats,
      maxAvailableSeats,
      passengerCount,
      minHour,
      maxHour,
      type = 'mot-chieu',
      limit = 10,
      page = 1,
      order = 'asc',
      sortBy = 'departureTime'
    } = validatedQuery

    const baseFilter: Record<string, any> = {
      isActive: { $ne: false }
    }

    let airlineIds: string[] | undefined

    // Lấy sân bay theo code nếu không có ID
    if (!departureAirportId && departureAirportCode) {
      const airport = await databaseService.airports.findOne({ code: departureAirportCode })
      if (!airport) throw new BadRequestError('Mã sân bay đi không hợp lệ')
      baseFilter.departureAirportId = airport._id
    } else if (departureAirportId) {
      baseFilter.departureAirportId = departureAirportId
    }

    if (!arrivalAirportId && arrivalAirportCode) {
      const airport = await databaseService.airports.findOne({ code: arrivalAirportCode })
      if (!airport) throw new BadRequestError('Mã sân bay đến không hợp lệ')
      baseFilter.arrivalAirportId = airport._id
    } else if (arrivalAirportId) {
      baseFilter.arrivalAirportId = arrivalAirportId
    }

    if (flightNumber) baseFilter.flightNumber = flightNumber

    if (typeof rawAirlineIds === 'string') {
      airlineIds = rawAirlineIds.split(',').filter(Boolean)
    } else if (Array.isArray(rawAirlineIds)) {
      airlineIds = rawAirlineIds
    }

    if (airlineIds && airlineIds.length > 0) {
      baseFilter.airlineId = { $in: airlineIds.map((id) => convertToObjectId(id)) }
    }

    if (duration) baseFilter.duration = duration

    const fareFilter = buildFareOptionsFilter({
      fareClass,
      minPrice,
      maxPrice,
      minAvailableSeats,
      maxAvailableSeats,
      passengerCount
    })

    if (fareFilter) {
      baseFilter.fareOptions = { $elemMatch: fareFilter }
    }

    const process = async (filter: any) => {
      const matchedFlights = await databaseService.flights
        .find(filter)
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .toArray()

      const filteredFlights = matchedFlights
        .map((flight) => {
          const filteredFareOptions = filterFareOptionsBackend({
            fareOptions: flight.fareOptions,
            fareClass,
            minPrice,
            maxPrice,
            minSeats: Math.max(passengerCount ?? 0, minAvailableSeats ?? 0),
            maxAvailableSeats
          })

          return {
            ...flight,
            fareOptions: filteredFareOptions
          }
        })
        .filter((flight) => flight.fareOptions.length > 0)
        .filter((flight) => {
          const hour = new Date(flight.departureTime).getHours()
          const matchMin = minHour !== undefined ? hour >= minHour : true
          const matchMax = maxHour !== undefined ? hour <= maxHour : true
          return matchMin && matchMax
        })

      return this.populateFlights(filteredFlights)
    }

    if (type === 'khu-hoi' && returnTime && baseFilter.departureAirportId && baseFilter.arrivalAirportId) {
      const departFilter = {
        ...baseFilter,
        departureTime: {
          $gte: startOfDay(departureTime ? new Date(departureTime) : new Date()),
          $lte: endOfDay(departureTime ? new Date(departureTime) : new Date())
        }
      }

      const returnFilter = {
        ...baseFilter,
        departureAirportId: baseFilter.arrivalAirportId,
        arrivalAirportId: baseFilter.departureAirportId,
        departureTime: {
          $gte: startOfDay(new Date(returnTime)),
          $lte: endOfDay(new Date(returnTime))
        }
      }

      const [departingFlights, returningFlights] = await Promise.all([process(departFilter), process(returnFilter)])

      const paginatedDeparting = departingFlights.slice((page - 1) * limit, page * limit)
      const paginatedReturning = returningFlights.slice((page - 1) * limit, page * limit)
      return {
        departingFlights: paginatedDeparting,
        returningFlights: paginatedReturning,
        pagination: createPagination(page, limit, departingFlights.length)
      }
    }

    // One-way
    const oneWayFilter = {
      ...baseFilter
    }

    if (departureTime) {
      oneWayFilter.departureTime = {
        $gte: startOfDay(new Date(departureTime)),
        $lte: endOfDay(new Date(departureTime))
      }
    }

    const oneWayFlights = await process(oneWayFilter)
    const paginatedFlights = oneWayFlights.slice((page - 1) * limit, page * limit)

    return {
      flights: paginatedFlights,
      pagination: createPagination(page, limit, oneWayFlights.length)
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

  static async getFlightById(id: ObjectId) {
    const { id: validatedId } = getFlightByIdSchema.params.parse({ id })

    const flight = await databaseService.flights.findOne({ _id: validatedId })
    const aircraft = await databaseService.aircrafts.findOne({ _id: flight?.aircraftId })
    const airline = await databaseService.airlines.findOne({ _id: flight?.airlineId })
    const departureAirport = await databaseService.airports.findOne({ _id: flight?.departureAirportId })
    const arrivalAirport = await databaseService.airports.findOne({ _id: flight?.arrivalAirportId })
    return {
      ...omitInfoData({ fields: ['createdAt', 'updatedAt'], object: flight }),
      aircraft: omitInfoData({ fields: ['seatConfiguration', 'createdAt', 'updatedAt'], object: aircraft }),
      airline: omitInfoData({ fields: ['createdAt', 'updatedAt'], object: airline }),
      departureAirport: omitInfoData({ fields: ['createdAt', 'updatedAt'], object: departureAirport }),
      arrivalAirport: omitInfoData({ fields: ['createdAt', 'updatedAt'], object: arrivalAirport })
    }
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
        isActive: flight.isActive,
        fareOptions: Array.isArray(flight.fareOptions)
          ? flight.fareOptions.map((fare: any) => ({
              class: fare.class,
              price: fare.price,
              availableSeats: fare.availableSeats,
              perks: fare.perks
            }))
          : [],
        airline: airline
          ? {
              _id: airline._id,
              name: airline.name,
              code: airline.code,
              logo: airline.logo
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
