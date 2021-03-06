# Aera
A Super-Simple HTTP Server library that makes use of functional programming paradigms, but stays unopinionated about how you handle your requests and responses.
___

[![Build Status](https://travis-ci.org/danielkov/aera.svg?branch=master)](https://travis-ci.org/danielkov/aera) [![Coverage Status](https://coveralls.io/repos/github/danielkov/aera/badge.svg?branch=development)](https://coveralls.io/github/danielkov/aera?branch=development) [![Dependencies](https://david-dm.org/danielkov/aera.svg)](https://david-dm.org/danielkov/aera) [![devDependencies Status](https://david-dm.org/danielkov/aera/dev-status.svg)](https://david-dm.org/danielkov/aera?type=dev) [![npm](https://img.shields.io/npm/v/aera.svg?style=flat-square)](https://npmjs.com/package/aera)

```js
const Aera = require('aera')

const app = new Aera()
app.get('/', () => 'Hello, World!')
```

See [the change log](changelog.md) for changes in this version!

## Basic usage

Install and add to your dependencies with the following line:

```sh
npm install --save aera
```

Below you can see a `Hello, World!` example, which is possibly the tiniest web application you can create.

```js
const Aera = require('aera')
const server = new Aera() // Default port is 3000

server.get('/', () => 'Hello, World!')
```

In Aera, you can pass a single function to a path handler and the return value of that function will be reflected in the response. Aera will attempt to make a few guesses, based on the content you provide, for example, if you return an object, it will be stringified and sent with the Content-Type: `application/json`.

Here are the types of return values you can pass to Aera at the moment:

  - String
  - Number
  - Promise
  - Object
  - Readable Stream
  - ... more to come

You can implement a static file server in a single line!

```js
server.get('/:file', ({ params }) => fs.createReadStream(`./my/folder/${params.file}`))
```

You can execute any function that returns any of the supported values and return the value of that, for example: template functions.

```js
server.get('/template', () => myTemplateFunction({name: 'Daniel', status: 'Awesome'}))
```

CRUD in a single line...

```js
server.get('/api/pets/:name', ({ params }) => db.find({ name: params.name })) // given that your db implementation returns a promise.
```

You can also play around with the data and then use it:

```js
server.get('/users/:id', ({ params }) => db.find({ _id: params.id }).then(formatUser).then(renderTemplate))
```

Simple request body echo server:

```js
server.post('/echo', (req) => req)
```

Creating Web Apps should be simple and fun.

## Exceptions and error handling

Aera tries to handle your exceptions for you, but it is completely fine if you want to have your own custom messages for exceptions. You can specify them in the options parameter of the `Aera()` constructor.

```js
const server = new Aera({port: 3000, notFoundException: 'Not the droids you are looking for. Sorry.'})
```

Of course if you wanted to make this nice, you can pass it a template function instead. That would also as long as it returns a valid string value.

```js
const server = new Aera({port: 3000, notFoundException: myNotFoundTemplate()})
```

Currently the following errors will be returned by Aera by default:

  - `notFoundException` status: 404, body: `Not found.` - returned when no path matches the request url.
  - `fileNotFoundException` status: 404, body: `File not found.` - returned when a stream is passed in and it errors.
  - `internalServerErrorException` status: 500, body: `Internal server error.` - returned when the handler has an uncaught exception.
  - `methodNotAllowedException` status: 405, body: `Method not allowed.` - returned when no handlers are available for the method of the path.

## Request and Response

In Aera, the `request` and `response` parameters are actually the native Node JS HTTP request and response objects. If you know how to use native HTTP, you'll know how to use Aera. Read up on the HTTP docs, [here](https://nodejs.org/api/http.html), or look for a guide in the guides folder.

## Running tests

You can run tests with the following line:

```sh
npm test
```

A little advice: in most use cases you can write tests for your application logic, without even involving Aera. This is because Aera encourages the concept of simple functional programming over side-effect-based middleware writing. Create your handlers, run tests on them and then plug them into Aera to see your content appear on your website or service.

## Future

The API is not yet evolved fully, however in the not so far future I'm looking into making it more friendly and easier in production use-cases as well.

## Contribution

I welcome contribution to this project in any form. If you'd like to work with me to improve anything (performance, features), feel free to submit an issue and create a PR.

Currently I am looking into ways to efficiently create hooks for certain events that happen, like `pre-routing`, `post-handler`, etc... This may be useful for authentication, normalization, header checks and so on. This will probably get released in the next major version `1.0.0`.
