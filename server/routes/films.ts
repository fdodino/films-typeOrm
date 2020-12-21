import { NotFoundError } from './../domain/errors'
import { routeProvider } from './asyncWrap'
import { BusinessError } from '../domain/errors'
import { NextFunction, Request, Response, Router } from 'express'
import { Film } from '../domain/film'
import { filmService } from '../services/filmService'

const router = Router()

router.post('/', routeProvider(async (request: Request, response: Response, _next: NextFunction) => {
  const requestFilm = request.body
  const newFilm = Object.assign(new Film(), { ...requestFilm })
  console.log('new film', newFilm)
  newFilm.validate()
  await filmService.addFilm(newFilm)
  response.json('Film successfully added')
}))

router.get('/', routeProvider(async (_request: Request, response: Response, _next: NextFunction) => {
  response.send(await filmService.getFilms())
}))

router.get('/:id', routeProvider(async (request: Request, response: Response, _next: NextFunction) => {
  validateId(request.params?.id)
  const film = await filmService.getFilmById(Number(request.params.id))
  if (!film) {
    throw new NotFoundError('Film ' + request.params.id + ' not found')
  } else {
    response.send(film)
  }
}))

router.delete('/:id', routeProvider(async (request: Request, response: Response, _next: NextFunction) => {
  validateId(request.params?.id)
  response.send(await filmService.delete(Number(request.params.id)))
}))

function validateId(id: string) {
  if (isNaN(Number(id))) {
    throw new BusinessError('Film id must be a number')
  }
}

export default router