const http = require('http')
const ptr = require('path-to-regexp')
const stream = require('stream')

const noMethodMatched = new Object()

module.exports = class Server {

  /**
   * constructor - for Server class
   *
   * @param  {object|number} options options to the constructor
   * @return {object}         instance of the class
   */
  constructor (options) {
    if (typeof options === 'number') {
      this.port = options
    }
    else if (typeof options === 'object') {
      this.port = options.port || 3000
    }
    else if (!options) {
      this.port = 3000
    }
    else {
      throw new Error('Options argument is not of types number or object.')
    }
    this.routes = []
    this.server = http.createServer(this._handler.bind(this))
    .listen(this.port)

    this.exceptions = {
      fileNotFound: options.fileNotFoundException || 'File not found.',
      notFound: options.notFoundException || 'Not found.',
      internalServerError: options.internalServerErrorException || 'Internal server error.',
      methodNotAllowed: options.methodNotAllowedException || 'Method not allowed.'
    }
  }


  /**
   * _createRoute - creates a route from the given handler function
   *
   * @param  {string} path    path to the route
   * @param  {function} handler function that should be added as a handler
   * @return {undefined}         returns undefined
   */
  _createRoute (path, method, handler) {
    let added = false
    let { routes } = this
    for (let i = routes.length - 1; i >= 0; i--) {
      if (routes[i].path === path) {
        routes[i][method] = handler
        added = true
        break
      }
    }
    if (!added) {
      let newRoute = {
        path,
        keys: []
      }
      newRoute.re = ptr(path, newRoute.keys)
      newRoute[method] = handler
      this.routes.push(newRoute)
    }
  }

  /**
   * _executeRoute - excecutes the route associated with the path
   *
   * @param  {string} path    path to match routes against
   * @param  {string} method  method to check the routes against
   * @param  {object} context the context of the http request event (request and response objects)
   * @return {many}         internal method, returns the return value of the executed path handler or false
   */
  _executeRoute (path, method, context) {
    let noMatch = true
    let { request, response } = context
    let result
    this.routes.forEach(route => {
      let match = path.match(route.re)
      if (match) {
        noMatch = false
        request.params = {}
        if (route[method]) {
          route.keys.forEach((key, i) => {
            request.params[key.name] = match[i + 1]
          })
          result = route[method](request, response)
        }
        else {
          return noMethodMatched
        }
      }
    })
    if (noMatch) {
      result = false
    }
    return result
  }

  /**
   * _createContext - creates a single context object from the request and response
   *
   * @param  {object} request the raw request object of http
   * @param  {object} result  the raw response object of http
   * @return {object}         the combined context object
   */
  _createContext (request, result) {
    return { request, result }
  }

  /**
   * _handler - this is the handler that gets passed into the http server instance
   *
   * @param  {object} req http request
   * @param  {object} res http response
   * @return {undefined}     internal method, returns undefined
   */
  _handler (req, res) {
    let path = req.url
    let method = req.method.toLowerCase()
    let context = this._createContext(req, res)
    let result
    try {
      result = this._executeRoute(path, method, context)
    } catch (e) {
      res.statusCode = 500
      res.end(this.exceptions.internalServerError)
    }
    if (!result) {
      res.statusCode = 404
      res.end(this.exceptions.notFound)
    }
    else if (result === noMethodMatched) {
      res.statusCode = 405
      res.end(this.exceptions.methodNotAllowed)
    }
    else if (typeof result === 'string' || typeof result === 'number') {
      if (!res.getHeader('content-type')) res.setHeader('Content-Type', 'text/html')
      res.end(result)
    }
    else if (typeof result === 'object' && typeof result.then === 'function') {
      result.then(r => res.end(r)).catch(e => {
        res.statusCode = 500
        res.end(e)
      })
    }
    else if (result instanceof stream.Readable) {
      result.on('error', (e) => {
        res.statusCode = 404
        res.end(this.exceptions.fileNotFound)
      })
      result.pipe(res)
    }
    else if (typeof result === 'object') {
      if (!res.getHeader('content-type')) res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
    }
    else {
      console.warn('Handler method returns no usable value.')
      res.end('')
    }
  }

  /**
   * get - adds a path to the route handlers with `GET` method.
   *
   * @param  {string} path string to match the path against
   * @param  {function} fn   handler function to add to the path
   * @return {object}      instance of the class
   */
  get (path, fn) {
    this._createRoute(path, 'get', fn)
    return this
  }

  /**
   * post - adds a path to the route handlers with `POST` method.
   *
   * @param  {string} path string to match the path against
   * @param  {function} fn   handler function to add to the path
   * @return {object}      instance of the class
   */
  post (path, fn) {
    this._createRoute(path, 'post', fn)
    return this
  }

  /**
   * put - adds a path to the route handlers with `PUT` method.
   *
   * @param  {string} path string to match the path against
   * @param  {function} fn   handler function to add to the path
   * @return {object}      instance of the class
   */
  put (path, fn) {
    this._createRoute(path, 'put', fn)
    return this
  }

  /**
   * delete - adds a path to the route handlers with `DELETE` method.
   *
   * @param  {string} path string to match the path against
   * @param  {function} fn   handler function to add to the path
   * @return {object}      instance of the class
   */
  delete (path, fn) {
    this._createRoute(path, 'delete', fn)
    return this
  }
}
