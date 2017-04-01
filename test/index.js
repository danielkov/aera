const request = require('supertest')
const assert = require('assert')
const Aera = require('../index')

const HttpError = require('../lib/utils/HttpError')

const { createReadStream } = require('fs')

describe('Aera instance', () => {
  describe('Constructor', () => {
    it('Accept no arguments', () => {
      const aera = new Aera()
      assert(aera instanceof Aera)
    })
    it('Should automatically assign port 3000 when no arguments passed', () => {
      const aera = new Aera()
      assert(aera.port === 3000)
    })
    it('Should accept a single number as argument', () => {
      const aera = new Aera(2999)
      assert(aera.port === 2999)
    })
    it('Accepts an object as an argument', () => {
      const aera = new Aera({port: 2998})
      assert(aera.port === 2998)
    })
    it('Accepts custom exception messages', () => {
      const aera = new Aera({
        port: 2997,
        fileNotFoundException: 'Custom message1',
        notFoundException: 'Custom message2',
        internalServerErrorException: 'Custom message3',
        methodNotAllowedException: 'Custom message4'
      })
      assert(aera.exceptions.fileNotFound === 'Custom message1')
      assert(aera.exceptions.notFound === 'Custom message2')
      assert(aera.exceptions.internalServerError === 'Custom message3')
      assert(aera.exceptions.methodNotAllowed === 'Custom message4')
    })
    it('Should create an empty routes array and an instance of http server', () => {
      const aera = new Aera({port: 2996})
      assert(typeof aera.server === 'object')
      assert(Array.isArray(aera.routes))
    })
    it('Should throw an error if options is invalid type', () => {
      function createInstance () {
        const s = new Aera('fail')
      }
      assert.throws(createInstance, Error, 'Options argument is not of types number or object.')
    })
  })
  describe('Testing internal functions', () => {

  })
  describe('Testing exposed functions', () => {
    const server = new Aera(2000)
    server.get('/test', () => 'Test')
    server.put('/test', () => 'Test')
    server.post('/test', () => 'Test')
    server.delete('/test', () => 'Test')
    let req = request('http://localhost:2000')
    it('get() should add a new handler to route GET method', (done) => {
      req.get('/test')
        .expect('Test')
        .expect(200, done)
    })
    it('post() should add a new handler to route POST method', (done) => {
      req.post('/test')
        .expect('Test')
        .expect(200, done)
    })
    it('put() should add a new handler to route PUT method', (done) => {
      req.put('/test')
        .expect('Test')
        .expect(200, done)
    })
    it('delete() should add a new handler to route DELETE method', (done) => {
      req.delete('/test')
        .expect('Test')
        .expect(200, done)
    })
  })
  describe('Testing route handling', () => {
    const server = new Aera(2017)
    server.get('/error', () => { throw new Error() }) // throws an error
    server.get('/json', () => ({test: 'test'})) // returns json
    server.get('/promise', () => new Promise((resolve, reject) => resolve('Promise tested.')))
    server.get('/promisefail', () => new Promise((resolve, reject) => reject(new Error('Promise tested.'))))
    server.post('/stream', req => req) // returns request body
    server.get('/params/:param', ({ params }) => `${params.param}`) // returns request parameter
    server.get('/noreturn', () => true) // returns undefined
    server.get('/streamerror', () => createReadStream('./doesntexist.txt'))
    server.get('/content', (req, res) => {
      res.setHeader('Content-Type', 'text/plain')
      return { test: 'hello' }
    })
    server.get('/text', (req, res) => {
      res.setHeader('Content-Type', 'application/xml')
      return 1234
    })
    let req = request('http://localhost:2017')
    it('should handle error page', (done) => {
      req.get('/error')
        .expect('Internal server error.')
        .expect(500, done)
    })
    it('should handle not found response', (done) => {
      req.get('/nothinghere')
        .expect('Not found.')
        .expect(404, done)
    })
    it('should handle json response', (done) => {
      req.get('/json')
        .expect('Content-Type', /json/)
        .expect(JSON.stringify({test: 'test'}))
        .expect(200, done)
    })
    it('should handle promise response', (done) => {
      req.get('/promise')
        .expect('Promise tested.')
        .expect(200, done)
    })
    it('should handle stream response', (done) => {
      let info = "test"
      req.post('/stream')
        .send(info)
        .expect(info)
        .expect(200, done)
    })
    it('should handle failed promise response', (done) => {
      req.get('/promisefail')
        .expect('Promise tested.')
        .expect(500, done)
    })
    it('should send method not allowed response', (done) => {
      req.put('/json')
        .expect('Method not allowed.')
        .expect(405, done)
    })
    it('should send down request params', (done) => {
      req.get('/params/test')
        .expect('test')
        .expect(200, done)
    })
    it('should handle not proper return values', (done) => {
      req.get('/noreturn')
        .expect('')
        .expect(200, done)
    })
    it('should handle erroring streams', (done) => {
      req.get('/streamerror')
        .expect('File not found.')
        .expect(404, done)
    })
    it('should not set content type if it has already been set', (done) => {
      req.get('/content')
        .expect('Content-Type', 'text/plain')
        .expect(200, done)
    })
    it('should not reset content type on strings or numbers either', (done) => {
      req.get('/text')
        .expect('1234')
        .expect('Content-Type', 'application/xml')
        .expect(200, done)
    })
  })
  describe('Testing utils', () => {
    it('HttpError should have a working toJson() method', () => {
      let e = new HttpError('Test', 400)
      assert.deepEqual(e.toJson(), {message: 'Test', status: 400})
    })
    it('HttpError should have a working toString() method', () => {
      let e = new HttpError('Test', 400)
      assert(e.toString(), '400: Test')
    })
  })
})
