module.exports = class HttpError extends Error {
  constructor (message, status) {
    super(message)
    this.status = status
    this.message = message
  }

  toJson () {
    return {
      message: this.message,
      status: this.status
    }
  }

  toString () {
    let message
    if (typeof this.message === 'object') {
      message = JSON.stringify(this.message)
    }
    else {
      message = this.message
    }
    return `${this.status}: ${message}`
  }
}
