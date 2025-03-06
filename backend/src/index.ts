import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import 'dotenv/config'
import { logger } from './utils/logger'
import router from '~/routes'
import databaseService from '~/services/database.services'
const app = express()

const PORT = process.env.APP_PORT as unknown as number

// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

databaseService.getDB()

app.use('/', router)

app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}/`)
})
