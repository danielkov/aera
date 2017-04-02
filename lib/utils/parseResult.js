const isPromise = require('./isPromise'),
      isReadableStream = require('./isReadableStream'),
      isDuplexStream = require('./isDuplexStream'),
      detectContentType = require('./detectContentType'),
      HttpError = require('./HttpError')

function setContentType (res, type) {
  if (!res.getHeader('content-type')) res.setHeader('Content-Type', type)
}

const parseResult = ({res, result, exceptions}) => {
  if (result instanceof Error) {
    res.statusCode = result.status || 500
    res.end(result.message)
  }
  else if (typeof result === 'string') {
    setContentType(res, 'text/html')
    res.end(result)
  }
  else if (typeof result === 'number') {
    setContentType(res, 'text/plain')
    res.end(result.toString())
  }
  else if (isPromise(result)) {
    result
    .then(r => parseResult({res, result: r, exceptions}))
    .catch(e => parseResult({res, result: e, exceptions}))
  }
  else if (isReadableStream(result) || isDuplexStream(result)) {
    result.on('error', e => parseResult({res, result: new HttpError(exceptions.fileNotFound, 404), exceptions}))
    setContentType(res, detectContentType(result))
    result.pipe(res)
  }
  else if (typeof result === 'object' || Array.isArray(result)) {
    setContentType(res, 'application/json')
    res.end(JSON.stringify(result))
  }
  else if (result === false) {
    res.end()
  }
  else {
    res.end('')
  }

}

module.exports = parseResult
