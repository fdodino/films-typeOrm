import express, { NextFunction, Request, Response } from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import indexRouter from './routes/index'
import filmsRouter from './routes/films'
import { StatusCodes } from 'http-status-codes'
import bodyParser from 'body-parser'

// error handler: err could be Error | NotFoundError | BusinessError
function errorHandler(err: any, request: Request, response: Response, _: NextFunction) {
  console.log('ERROR ******************************************************************')
  console.log(JSON.parse(JSON.stringify(err)))
  const status = (err.userOrigin) ? err.statusCode() : StatusCodes.INTERNAL_SERVER_ERROR
  const message = (err.userOrigin) ? err.message : 'An error has occurred. Please report a new issue.'
  response.status(status).send(message)
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(path.resolve(), '../public')))

app.use('/', indexRouter)
app.use('/films', filmsRouter)

// Error Handler must be after routes
app.use(errorHandler)

export default app