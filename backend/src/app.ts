import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import 'dotenv/config'
import { Request, Response, NextFunction } from 'express'
import router from '~/routes'
import databaseService from '~/services/database.services'
import { ErrorResponse } from '~/responses/error.response'
import { initFolder } from '~/utils/files.utils'
import { initAdminAccount } from '~/services/initAdmin.services'
import { UPLOAD_DIR } from '~/constants/dir'

const app = express()
//init folder
initFolder()
// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'x-api-key', 'authorization', 'x-client-id', 'x-rtoken-id']
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// init database
databaseService.getDB()
databaseService.initIndexes()

// init admin account
;(async function init() {
  await initAdminAccount()
})()

// init route
app.use('/', router)
// handling error
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new ErrorResponse('Not Found', 404)
  next(error)
})

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error instanceof ErrorResponse ? error.status : 500

  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: error.message || 'Internal Server Error',
    stack: error.stack
  })
})

export default app
