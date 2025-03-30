'use strict'
import { Response } from 'express'
import { HttpResponse } from '~/constants/httpStatusCode'

const { ReasonPhrases, StatusCodes } = HttpResponse

interface ResponseData {
  [key: string]: any
}

class SuccessResponse {
  message: string
  statusCode?: number
  reasonStatusCode?: string
  metadata?: ResponseData

  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata = {}
  }: {
    message: string
    statusCode?: number
    reasonStatusCode?: string
    metadata?: ResponseData
  }) {
    this.message = !message ? (reasonStatusCode as string) : message
    this.statusCode = statusCode
    this.reasonStatusCode = reasonStatusCode
    this.metadata = metadata
  }

  send(res: Response) {
    return res.status(this.statusCode as number).json(this)
  }
}

class OK extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata = {}
  }: {
    message: string
    statusCode?: number
    reasonStatusCode?: string
    metadata?: ResponseData
  }) {
    super({ message, reasonStatusCode, statusCode, metadata })
  }
}

class Created extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatusCode = ReasonPhrases.CREATED,
    metadata = {}
  }: {
    message: string
    statusCode?: number
    reasonStatusCode?: string
    metadata?: ResponseData
  }) {
    super({ message, reasonStatusCode, statusCode, metadata })
  }
}

class NoContent extends SuccessResponse {
  constructor(
    message: string,
    reasonStatusCode = ReasonPhrases.NO_CONTENT,
    statusCode = StatusCodes.CREATED,
    metadata?: ResponseData
  ) {
    super({ message, reasonStatusCode, statusCode, metadata })
  }
}

export { SuccessResponse, OK, Created, NoContent }
