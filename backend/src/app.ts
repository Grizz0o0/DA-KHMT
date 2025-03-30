import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import 'dotenv/config'
import { Request, Response, NextFunction } from 'express'
import router from '~/routes'
import databaseService from '~/services/database.services'
import { ErrorResponse } from '~/responses/error.response'
import { initFolder } from '~/utils/filesUtils'
import { UPLOAD_DIR } from '~/constants/dir'
const app = express()
//init folder
initFolder()

// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// init database
databaseService.getDB()
databaseService.indexUsers()
databaseService.indexRefreshTokens()
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
