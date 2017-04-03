const mimes = require('./mime.json')

module.exports = (stream) => {
  let path = stream.path || '.txt'
  let mime = path.split('.').pop()
  return mimes[mime] || 'text/plain'
}
