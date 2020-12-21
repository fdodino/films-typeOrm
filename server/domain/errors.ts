/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'

export class BusinessError {
  
  constructor(public message: string) {}
  
  get userOrigin() { return true }

  statusCode() {
    return StatusCodes.BAD_REQUEST
  }
}

export class NotFoundError {
  constructor(public message: string) {}

  get userOrigin() { return true }

  statusCode() {
    return StatusCodes.NOT_FOUND
  }
}