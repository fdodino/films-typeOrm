import { Film } from '../domain/film'
import { createConnection, EntityManager } from 'typeorm'

/**
 * Class is private
 */
export class FilmService {
  entityManager: EntityManager | undefined = undefined

  constructor() {
    this.initialize()
  }

  async initialize(environment = 'dev') {
    const connection = await createConnection(environment)
    connection.synchronize()
    this.entityManager = connection.createEntityManager()
  }

  async getFilms() {
    return this.entityManager!.find(Film)
  }

  async getFilmById(filmId: number) {
    return this.entityManager!.find(Film, { where: { id: filmId } })
  }

  async addFilm(film: Film) {
    await this.entityManager!.save(film)
  }

  async delete(filmId: number) {
    await this.entityManager!.delete(Film, { id: filmId })
  }
}

/**
 * Singleton object exposed
 */
export const filmService = new FilmService()