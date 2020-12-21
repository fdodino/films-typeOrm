Este proyecto tomó como base [este artículo](https://www.freecodecamp.org/news/how-to-enable-es6-and-beyond-syntax-with-node-and-express-68d3e11fe1ab/)

## Configuración del servidor

- https://developer.mozilla.org/es/docs/Learn/Server-side/Express_Nodejs/development_environment
- https://timonweb.com/javascript/how-to-enable-ecmascript-6-imports-in-nodejs/

## Cómo probar el código

### Requisitos

- Instalar node
- Configurar la versión de node

```bash
nvm install 12.10
nvm use
```

### Scripts

- `npm start`: levanta el servidor y están las rutas disponibles
- `npm test`: corre los tests unitarios
- los otros los podés chusmear

## IDE

- VSCode
- importación
  - wix.vscode-import-cost | Wix
  - nucllear.vscode-extension-auto-import | Sergey Korenuk
- https://code.visualstudio.com/docs/nodejs/extensions
- https://scotch.io/bar-talk/11-awesome-javascript-extensions-for-visual-studio-code

## Manejo de errores

Al igual que en Spring, tenemos la opción de definir en un solo lugar el manejo de errores, evitando el try/catch en cada endpoint:

```js
// error handler
function errorHandler(err, request, response, next) {
  console.log('ERROR ******************************************************************')
  console.log(JSON.parse(JSON.stringify(err)))
  const status = (err.userOrigin) ? err.statusCode() : StatusCodes.INTERNAL_SERVER_ERROR
  const message = (err.userOrigin) ? err.message : "An error has occurred. Please report a new issue."
  response.status(status).send(message)
}
```

Utilizamos la notación `function` más que la arrow function porque tiene menos inconvenientes (como el binding de `this`). TODO: pasar un link comparativo.

Para eso tenemos objetos que modelan los errores y definen qué código HTTP tienen asociado:

```js
export class BusinessError {
  constructor(message) {
    this.message = message
    this.userOrigin = true
  }

  statusCode() {
    return StatusCodes.BAD_REQUEST
  }
}

export class NotFoundError {
  constructor(message) {
    this.message = message
    this.userOrigin = true
  }

  statusCode() {
    return StatusCodes.NOT_FOUND
  }
}
```

Podríamos armar una jerarquía de errores "de negocio" para no repetir la definición del flag userOrigin. También si estuviéramos en Java podríamos no necesitar esa referencia y agrupar dos tipos diferentes de errores: BusinessException / Exception a secas. El primero refleja errores de negocio y el segundo errores de programa.

La configuración se completa en el archivo `app` donde debemos ser precavidos y registrar la función de manejo de error genérico **después de las rutas**, de otra manera tendremos un 500 Internal Server Error ante cualquier tipo de excepción:

```js
app.use('/', indexRouter)
app.use('/films', filmsRouter)

// Error Handler must be after routes
app.use(errorHandler)
```

## Testeo unitario con JEST

Para configurar la importación de archivos con `import` en lugar de `require`, recomendamos seguir [este artículo](https://bl.ocks.org/rstacruz/511f43265de4939f6ca729a3df7b001c):

```bash
npm i -D @babel/core @babel/plugin-transform-modules-commonjs babel-jest
```

- Configurar jest en el `package.json` como está en el proyecto (o configurarlo en un archivo aparte: `jest.config.js`)

El primer test es simple, chequeamos que al pedir todas las películas nos devuelva status 200 (OK) y un JSON:

```js
  it('should render all films', async () => {
    await request(app).get('/films')
      .expect('Content-Type', /json/)
      .expect(200)
  })
```

Luego, podemos preguntar si al pedir una película que no existe recibimos un 404:

```js
  it('should return a not found status while searching for an unexistent film', async () => {
    await request(app).get('/films/500')
      .expect(404)
  })
```

Lo que nos lleva a preguntar:

- quién es el objeto devuelto por `request(app)`
- ¿qué película es la que sabemos que no existe? ¿qué pasa si alguien crea una película que tiene id 500, se rompe el test?

### Mockeando el servicio

JEST trae una forma de generar un servicio "de resguardo" (mock o stub), en particular a mí no me funcionó (pueden ver [estos ejemplos](https://jestjs.io/docs/en/es6-class-mocks)), pero una alternativa fácil para cambiar la implementación es aprovechar el caracter dinámico de JS, obtener una referencia al singleton y cambiarlo en el test:

```js
it('should return a not found status while searching for an unexistent film - services mocked', async function() {
  filmService.getFilmById = function(_) { return undefined }
  await request(app).get('/films/1').expect(404)
})
```

### Mockeando para simular un error

La misma técnica utilizaremos para simular un error: cambiamos la implementación del service para hacer que devuelva un error.

```js
it('should return an internal server error status while searching for a film and having an error - services mocked', async function() {
  filmService.getFilmById = function(_) { throw new Error('Expected error') }
  await request(app).get('/films/1').expect(500)
})
```

### Tests solitarios vs. sociales

Como menciona [Martin Fowler en su artículo](https://martinfowler.com/bliki/UnitTest.html), tenemos dos tipos de tests: los tests solitarios y los sociales. 

Cuando generamos implementaciones falsas, nuestro objetivo es probar unitariamente que el ruteo devuelve los códigos de error HTTP que se esperan: los _stubs_ o _mocks_ nos sirven para generar una respuesta determinística (como en el 404, no depende de los datos que tengamos almacenados) o bien para simular una situación que es difícil de reproducir (como en el 500). Hablamos en esta situación de **tests solitarios**.

En los primeros casos cuando hacíamos la prueba del endpoint, el test es social, porque se verificaba:

- el ruteo del path hacia la función que se encarga de responder
- el service que hace la tarea (por el momento trabajando con una colección en memoria)
- e incluso participa el dominio (aunque por ahora no tengamos comportamiento interesante)

Ambas estrategias se complementan mutuamente, mientras que los tests solitarios favorecen el TDD (porque es necesario crear menos unidades para que nuestro test de verde), el test social funciona como integrador de componentes y tiene un mayor grado de fiabilidad (aunque es más inestable ==> fácil de romper).

## TypeORM

Hay que agregar al package.json 

- typeorm
- mysql (en nuestro caso porque queremos trabajar contra una base MySQL)
- reflect-metadata

pero además como vamos a trabajar con "annotations" (que en el mundo Javascript se llaman decorators), tenemos que

- crear un archivo `jsconfig.json` para habilitar la opción de tener decoradores
- agregar la dependencia `@babel/plugin-proposal-decorators` en el `package.json` y una configuración más para que no hinche

```json
"plugins": [
  ["@babel/plugin-proposal-decorators", { "legacy": true }],
  "@babel/plugin-proposal-class-properties"
]
```

## Desafíos

- pasar de Javascript a Typescript: la principal razón es que TypeORM se siente mucho más cómodo en TS, y sobre todo porque el sistema de anotaciones piola solo podés hacerlo con `@decorators` que ECMA Script no soporta. Esto implicó:
  - agregar dependencias en el `package.json`, usar el `.eslintrc`, tener un `tsconfig.json`, convertir los `js` a `ts`
- las búsquedas y actualizaciones a la base son asincrónicas, el error handler de express hay que envolverlo para poder definir funciones async en nuestras rutas. El wrapper que creamos envuelve la función async y llama al `next` para que el error handler pueda mostrarlo exitosamente (ver `asyncWrap.ts`)

