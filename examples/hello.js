const Server = require('../index')
const fs = require('fs')

const server = new Server(3000)

server

// Sending a regular Hello, World!
.get('/', () => 'Hello, World!')

// Sending a generated string via parameters.
.get('/:name', ({ params }, res) => `Hello, ${params.name}!`)

// Sending a generated JSON from parameters. NOTE: Content Type headers will be properly set.
.get('/api/json/:name/:email', ({ params }, res) => ({name: params.name, email: params.email, time: new Date().toUTCString()}))

// Serving files from the static folder is literally this simple. Streams are automatically piped to the response.
.get('/static/:file', ({ params }) => fs.createReadStream(`./static/${params.file}`))

// Sending a promise as the return value. When navigated to the route, this responds accordinly after 1 second.
.get('/promise/:name', ({ params }) => new Promise((resolve, reject) => setTimeout(() => resolve(`Late response to: ${params.name}`),1000)))

// Return the body of the request in the response like an echo server.
.post('/echo', (req) => req)

.listen()
