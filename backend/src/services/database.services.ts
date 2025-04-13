import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import 'dotenv/config'
import configMongodb from '~/config/config.mongodb'
import { UserType } from '~/models/users.model'
import { RefreshTokenType } from '~/models/refreshToken.model'
import { AirlineType } from '~/models/airlines.model'
import { AirportType } from '~/models/airports.model'
import { AircraftType } from '~/models/aircrafts.model'
import { FlightType } from '~/models/flights.model'
import { BookingType } from '~/models/bookings.model'
import { TicketType } from '~/models/tickets.model'
const { database } = configMongodb
const { username, password, name } = database

const connectString = `mongodb+srv://${username}:${password}@travel.7mvee.mongodb.net/?retryWrites=true&w=majority&appName=${name}`

class DatabaseService {
  private static instance: DatabaseService
  private db: Db
  private client: MongoClient
  private constructor() {
    this.client = new MongoClient(connectString, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true
      }
    })
    this.connect()
    this.db = this.client.db(name)
  }

  private async connect(): Promise<void> {
    try {
      await this.client.db('admin').command({ ping: 1 })
      console.log('Connect MongoDB Success !!!')
    } catch (error) {
      console.error('Error Connect !!!', error)
      process.exit(1)
    }
  }

  public async indexUsers() {
    const existIndex = await this.users.indexExists(['email_1', 'username_1'])
    if (!existIndex) {
      await this.users.createIndex({ email: 1 }, { unique: true })
      await this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  public async indexRefreshTokens() {
    const existIndex = await this.refreshTokens.indexExists(['userId_1', 'refreshToken_1', 'expiresAt_1'])
    if (!existIndex) {
      await this.refreshTokens.createIndex({ userId: 1 }, { unique: true })
      await this.refreshTokens.createIndex({ refreshToken: 1 }, { unique: true })
      await this.refreshTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    }
  }

  public async indexAirlines() {
    const existIndex = await this.airlines.indexExists(['name_text', 'code_1'])
    if (!existIndex) {
      await this.airlines.createIndex({ name: 'text' })
      await this.airlines.createIndex({ code: 1 }, { unique: true })
    }
  }

  public async indexAirports() {
    const existIndex = await this.airports.indexExists(['country_1_city_1', 'code_1', 'name_text'])
    if (!existIndex) {
      await this.airports.createIndex({ code: 1 }, { unique: true })
      await this.airports.createIndex({ country: 1, city: 1 })
      await this.airports.createIndex({ name: 'text' })
    }
  }

  public async indexAircrafts() {
    const existIndex = await this.aircrafts.indexExists([
      'airlineId_1',
      'status_1',
      'model_1',
      'manufacturer_1',
      'aircraftCode_1',
      'model_text_manufacturer_text'
    ])
    if (!existIndex) {
      await this.aircrafts.createIndex({ airlineId: 1 })
      await this.aircrafts.createIndex({ status: 1 })
      await this.aircrafts.createIndex({ model: 1 })
      await this.aircrafts.createIndex({ manufacturer: 1 })
      await this.aircrafts.createIndex({ aircraftCode: 1 }, { unique: true })
      await this.aircrafts.createIndex({ model: 'text', manufacturer: 'text' })
    }
  }

  public async indexFlights() {
    const existIndex = await this.flights.indexExists([
      'departureAirportId_1_arrivalAirportId_1_departureTime_1',
      'flightNumber_1',
      'airlineId_1_departureTime_1',
      'aircraftId_1_departureTime_1',
      'departureTime_1_arrivalTime_1',
      'price_1_availableSeats_1',
      'flightNumber_text'
    ])
    if (!existIndex) {
      await this.flights.createIndex({
        departureAirportId: 1,
        arrivalAirportId: 1,
        departureTime: 1
      })
      await this.flights.createIndex({ flightNumber: 1 }, { unique: true })
      await this.flights.createIndex({ airlineId: 1, departureTime: 1 })
      await this.flights.createIndex({ aircraftId: 1, departureTime: 1 })
      await this.flights.createIndex({ departureTime: 1, arrivalTime: 1 })
      await this.flights.createIndex({ price: 1, availableSeats: 1 })
      await this.flights.createIndex({ flightNumber: 'text' })
    }
  }

  public async indexBookings() {
    const existIndex = await this.bookings.indexExists([
      'userId_1_createdAt_1',
      'flightId_1_departureTime_1',
      'status_1_paymentStatus_1',
      'totalPrice_1_createdAt_1',
      'bookingCode_1'
    ])
    if (!existIndex) {
      await this.bookings.createIndex({ userId: 1, createdAt: 1 })
      await this.bookings.createIndex({ flightId: 1, departureTime: 1 })
      await this.bookings.createIndex({ status: 1, paymentStatus: 1 })
      await this.bookings.createIndex({ totalPrice: 1, createdAt: 1 })
      await this.bookings.createIndex({ bookingCode: 1 }, { unique: true })
    }
  }

  public async indexTickets() {
    const existIndex = await this.tickets.indexExists([
      'flightId_1',
      'bookingId_1',
      'status_1',
      'seatNumber_1',
      'passenger.name_text',
      'passenger.email_text'
    ])
    if (!existIndex) {
      await this.tickets.createIndex({ flightId: 1 })
      await this.tickets.createIndex({ bookingId: 1 })
      await this.tickets.createIndex({ status: 1 })
      await this.tickets.createIndex({ seatNumber: 1 })
      await this.tickets.createIndex({ 'passenger.name': 'text', 'passenger.email': 'text' })
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  public async getDB() {
    return this.client.db(name)
  }

  get users(): Collection<UserType> {
    return this.db.collection('Users')
  }

  get refreshTokens(): Collection<RefreshTokenType> {
    return this.db.collection('Refresh_tokens')
  }

  get airlines(): Collection<AirlineType> {
    return this.db.collection('Airlines')
  }

  get airports(): Collection<AirportType> {
    return this.db.collection('Airports')
  }

  get aircrafts(): Collection<AircraftType> {
    return this.db.collection('Aircrafts')
  }

  get flights(): Collection<FlightType> {
    return this.db.collection('Flights')
  }

  get bookings(): Collection<BookingType> {
    return this.db.collection('Bookings')
  }

  get tickets(): Collection<TicketType> {
    return this.db.collection('Tickets')
  }
}

const databaseService = DatabaseService.getInstance()
export default databaseService
