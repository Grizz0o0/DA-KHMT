'use strict'
import 'dotenv/config'
interface AppConfig {
  app: {
    port: number | string
  }
  database: {
    username: string
    password: number | string
    name: string
  }
}

const dev: AppConfig = {
  app: {
    port: process.env.APP_PORT || 3052
  },
  database: {
    username: process.env.DB_USERNAME || 'vuonghongky26',
    password: process.env.DB_PASSWORD || 26112003,
    name: process.env.DB_NAME || 'Travel'
  }
}

const pro: AppConfig = {
  app: {
    port: process.env.APP_PORT || 3052
  },
  database: {
    username: process.env.DB_USERNAME || 'vuonghongky26',
    password: process.env.DB_PASSWORD || 26112003,
    name: process.env.DB_NAME || 'Travel'
  }
}

const config: Record<string, AppConfig> = { dev, pro }
const env: string = process.env.NODE_ENV || 'dev'

export default config[env]
