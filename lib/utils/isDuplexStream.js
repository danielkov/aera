const { Duplex } = require('stream')

module.exports = (e) => (e instanceof Duplex)
