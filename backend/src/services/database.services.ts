import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import 'dotenv/config'
import configMongodb from '~/config/config.mongodb'
import { UserType } from '~/models/schemas/users.schema'
import { RefreshTokenType } from '~/models/schemas/refreshToken.schema'
import { AirlineType } from '~/models/schemas/airlines.schema'
import { AirportType } from '~/models/schemas/airports.schema'
import { AircraftType } from '~/models/schemas/aircrafts.schema'

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
}

const databaseService = DatabaseService.getInstance()
export default databaseService
