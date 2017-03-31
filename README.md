# Aera

A Super-Simple HTTP Server library that makes use of functional programming paradigms, but stays unopinionated about how you handle your requests and responses.

## Basic usage

Below you can see a `Hello, World!` example, which is possibly the tiniest web application you can create.

```js
const Aera = require('aera')
const server = new Aera() // Default port is 3000

server.get('/' () => 'Hello, World!')
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

## Future

The API is not yet evolved fully, however in the not so far future I'm looking into making it more friendly and easier in production use-cases as well.

## Contribution

I welcome contribution to this project in any form. If you'd like to work with me to improve anything (performance, features), feel free to submit an issue and create a PR.
