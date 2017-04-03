const http = require('http')
const url = require('url')
const ptr = require('path-to-regexp')

const isReadableStream = require('./utils/isReadableStream')
const isDuplexStream = require('./utils/isDuplexStream')
const isPromise = require('./utils/isPromise')

const HttpError = require('./utils/HttpError')
const parseResult = require('./utils/parseResult')

module.exports = class Server {

  /**
   * constructor - for Server class
   *
   * @param  {object|number} options options to the constructor
   * @return {object}         instance of the class
   */
  constructor (options) {
    let opts = options || {}
    if (typeof opts === 'number') {
      this.port = opts
    }
    else if (typeof opts === 'object') {
      this.port = opts.port || 3000
    }
    else {
      throw new Error('Options argument is not of types number or object.')
    }
    this.routes = []
    this.server = http.createServer(this._handler.bind(this))
    .listen(this.port)

    this.exceptions = {
      fileNotFound: opts.fileNotFoundException || 'File not found.',
      notFound: opts.notFoundException || 'Not found.',
      internalServerError: opts.internalServerErrorException || 'Internal server error.',
      methodNotAllowed: opts.methodNotAllowedException || 'Method not allowed.'
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
    let parsed = url.parse(path, true)
    path = parsed.pathname
    let query = parsed.query
    this.routes.forEach(route => {
      let match = path.match(route.re)
      if (match) {
        noMatch = false
        request.query = query
        request.params = {}
        if (route[method]) {
          route.keys.forEach((key, i) => {
            request.params[key.name] = match[i + 1]
          })
          result = route[method](request, response)
        }
        else if (method === 'head' && route['get']) {
          route['get'](request, response)
          result = false
        }
        else {
          result = new HttpError(this.exceptions.methodNotAllowed, 405)
        }
      }
    })
    if (noMatch) {
      result = new HttpError(this.exceptions.notFound, 404)
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
  _createContext (request, response) {
    return { request, response }
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
      result = new HttpError(e.message || this.exceptions.internalServerError, e.status || 500)
    }
    let { exceptions } = this
    parseResult({res, result, exceptions})
  }

  /**
   * get - adds a path to the route handlers with `GET` method.
   *
   * @param  {string} path string to match the path against
   * @param  {function} fn   handler function to add to the path
   * @return {object}      instance of the class
   */
  get (...args) {
    let path
    let fn
    if (Array.isArray(args[0])) {
      path = args[0][0]
      fn = args[0][1]
    }
    else {
      path = args[0]
      fn = args[1]
    }
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
  post (...args) {
    let path
    let fn
    if (Array.isArray(args[0])) {
      path = args[0][0]
      fn = args[0][1]
    }
    else {
      path = args[0]
      fn = args[1]
    }
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
  put (...args) {
    let path
    let fn
    if (Array.isArray(args[0])) {
      path = args[0][0]
      fn = args[0][1]
    }
    else {
      path = args[0]
      fn = args[1]
    }
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
  delete (...args) {
    let path
    let fn
    if (Array.isArray(args[0])) {
      path = args[0][0]
      fn = args[0][1]
    }
    else {
      path = args[0]
      fn = args[1]
    }
    this._createRoute(path, 'delete', fn)
    return this
  }

  /**
   * head - adds a path to the route handlers with `HEAD` method.
   *
   * @param  {string} path string to match the path against
   * @param  {function} fn   handler function to add to the path
   * @return {object}      instance of the class
   */
  head (...args) {
    let path
    let fn
    if (Array.isArray(args[0])) {
      path = args[0][0]
      fn = args[0][1]
    }
    else {
      path = args[0]
      fn = args[1]
    }
    this._createRoute(path, 'head', fn)
    return this
  }

  /**
   * options - adds a path to the route handlers with `OPTIONS` method.
   *
   * @param  {string} path string to match the path against
   * @param  {function} fn   handler function to add to the path
   * @return {object}      instance of the class
   */
  options (...args) {
    let path
    let fn
    if (Array.isArray(args[0])) {
      path = args[0][0]
      fn = args[0][1]
    }
    else {
      path = args[0]
      fn = args[1]
    }
    this._createRoute(path, 'options', fn)
    return this
  }

  /**
   * patch - adds a path to the route handlers with `PATCH` method.
   *
   * @param  {string} path string to match the path against
   * @param  {function} fn   handler function to add to the path
   * @return {object}      instance of the class
   */
  patch (...args) {
    let path
    let fn
    if (Array.isArray(args[0])) {
      path = args[0][0]
      fn = args[0][1]
    }
    else {
      path = args[0]
      fn = args[1]
    }
    this._createRoute(path, 'patch', fn)
    return this
  }
}
