import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import 'dotenv/config'
import configMongodb from '~/config/config.mongodb'
import User from '~/models/schemas/users.schema'
import RefreshToken from '~/models/schemas/refreshToken.schema'

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
        strict: true,
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
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  public async indexRefreshTokens() {
    const existIndex = await this.refreshTokens.indexExists(['userId_1', 'refreshToken_1', 'expiresAt_1'])
    if (!existIndex) {
      this.refreshTokens.createIndex({ userId: 1 }, { unique: true })
      this.refreshTokens.createIndex({ refreshToken: 1 }, { unique: true })
      this.refreshTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
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

  get users(): Collection<User> {
    return this.db.collection('Users')
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('Refresh_tokens')
  }
}

const databaseService = DatabaseService.getInstance()
export default databaseService
