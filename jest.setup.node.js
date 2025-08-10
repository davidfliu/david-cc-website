// ABOUTME: Jest setup file specifically for Node.js environment tests (API routes)
// ABOUTME: Provides Web API polyfills and mocks needed for Next.js API route testing

const { TextEncoder, TextDecoder } = require('util')
const { Blob } = require('buffer')

// Polyfill Web APIs for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.Blob = Blob

// Mock Response for Next.js API routes
global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.headers = new Map(Object.entries(options.headers || {}))
    this._bodyUsed = false
  }

  static json(data, options = {}) {
    return new Response(JSON.stringify(data), {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...options.headers
      }
    })
  }

  async json() {
    if (this._bodyUsed) throw new TypeError('Body has already been consumed')
    this._bodyUsed = true
    return JSON.parse(this.body)
  }

  async text() {
    if (this._bodyUsed) throw new TypeError('Body has already been consumed')
    this._bodyUsed = true
    return this.body
  }
}

// Mock Headers for Next.js API routes
global.Headers = class Headers {
  constructor(init = {}) {
    this._headers = new Map()
    if (init) {
      if (Array.isArray(init)) {
        for (const [key, value] of init) {
          this.set(key, value)
        }
      } else if (typeof init === 'object') {
        for (const [key, value] of Object.entries(init)) {
          this.set(key, value)
        }
      }
    }
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), String(value))
  }

  has(name) {
    return this._headers.has(name.toLowerCase())
  }

  delete(name) {
    this._headers.delete(name.toLowerCase())
  }

  entries() {
    return this._headers.entries()
  }

  keys() {
    return this._headers.keys()
  }

  values() {
    return this._headers.values()
  }

  forEach(callback) {
    this._headers.forEach(callback)
  }
}

// Mock Request for Next.js API routes
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = new Headers(options.headers)
    this.body = options.body
    this._bodyUsed = false
  }

  async json() {
    if (this._bodyUsed) throw new TypeError('Body has already been consumed')
    this._bodyUsed = true
    return JSON.parse(this.body)
  }

  async text() {
    if (this._bodyUsed) throw new TypeError('Body has already been consumed')
    this._bodyUsed = true
    return this.body
  }
}