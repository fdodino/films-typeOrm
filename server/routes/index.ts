import { NextFunction, Request, Response, Router  } from 'express'

const router = Router()

/* GET home page. */
router.get('/', function (req: Request, res: Response, _next: NextFunction) {
  res.json({ 'message': 'Welcome to Arifici project!' })
})

export default router