import request from 'supertest'
import app from '../app'
import { filmService } from '../services/filmService'

describe('Films Endpoints', () => {

  beforeAll(async () => {
    await filmService.initialize('test')
  })  

  describe('Films Endpoints with real connection to the database', () => {

    it('should render all films', async function () {
      await request(app).get('/films')
        .expect('Content-Type', /json/).expect(200)
    })

    it('should return a not found status while searching for an unexistent film', async function () {
      await request(app).get('/films/500').expect(404)
    })

  })

  describe('Films Endpoints with services mocked', function () {

    it('should return a not found status while searching for an unexistent film - services mocked', async function () {
      const currentGetFilmById = filmService.getFilmById
      filmService.getFilmById = function (_) { return Promise.resolve([]) }
      await request(app).get('/films/1').expect(404)
      filmService.getFilmById = currentGetFilmById
    })
  
    it('should return an internal server error status while searching for a film and having an error - services mocked', async function () {
      filmService.getFilmById = function (_) { throw new Error('Expected error') }
      await request(app).get('/films/1').expect(500)
    })
  
  })
})