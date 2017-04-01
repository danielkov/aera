const mimes = require('./mime.json')

module.exports = (stream) => {
  let path = stream.path || '.txt'
  return mimes[path.split('.').pop()]
}
