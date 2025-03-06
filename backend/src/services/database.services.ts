import { Db, MongoClient, ServerApiVersion } from 'mongodb'
import 'dotenv/config'
import configMongodb from '~/config/config.mongodb'

const { database } = configMongodb
const { username, password, name } = database

const connectString = `mongodb+srv://${username}:${password}@travel.7mvee.mongodb.net/?retryWrites=true&w=majority&appName=${name}`

class DatabaseService {
  private static instance: DatabaseService
  private db: Db
  private client: MongoClient
  constructor() {
    this.client = new MongoClient(connectString, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.connect()
    this.db = this.client.db(process.env.DB_NAME)
  }
  private async connect(): Promise<void> {
    try {
      await this.client.db('admin').command({ ping: 1 })
      console.log('Connect MongoDB Success !!!')
    } catch (error) {
      console.error('Error Connect !!!', error)
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  public getDB() {
    return this.client.db(name)
  }

  get users() {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
}

const databaseService = DatabaseService.getInstance()
export default databaseService
