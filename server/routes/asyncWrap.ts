import { NextFunction, Request, Response } from 'express'

export const routeProvider = (routeHandlerFn: Function) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await routeHandlerFn(req, res, next)
  } catch(error) {
    next(error)
  }
}