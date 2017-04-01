const { Readable } = require('stream')

module.exports = (e) => (e instanceof Readable)
