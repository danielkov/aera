module.exports = class HttpError extends Error {
  constructor (message, status) {
    super(message)
    this.status = status
  }

  toString () {
    return `${this.status}: ${this.message}`
  }

  toJson () {
    return {
      status: this.status,
      message: this.message
    }
  }
}
