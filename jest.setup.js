// ABOUTME: Jest setup file for configuring testing environment and global mocks
// ABOUTME: Includes DOM testing library setup and essential browser API mocks

require('@testing-library/jest-dom')

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  }
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  }
}))

// Mock browser APIs
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
  },
  configurable: true,
})

Object.defineProperty(navigator, 'sendBeacon', {
  value: jest.fn(() => true),
  configurable: true,
})

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  configurable: true,
})

// Mock fetch for API tests
global.fetch = jest.fn()

// Add Web API polyfills for Node.js environment (for API route tests)
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

if (typeof Response === 'undefined') {
  // Mock Response for API route tests
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
}

if (typeof Headers === 'undefined') {
  // Mock Headers for API route tests
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
}

if (typeof Request === 'undefined') {
  // Basic Request polyfill for Node.js environment
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this.headers = init.headers || new Headers()
      this.body = init.body || null
      this.mode = init.mode || 'cors'
      this.credentials = init.credentials || 'same-origin'
      this.cache = init.cache || 'default'
      this.redirect = init.redirect || 'follow'
      this.referrer = init.referrer || ''
      this.referrerPolicy = init.referrerPolicy || ''
      this.integrity = init.integrity || ''
      this.keepalive = init.keepalive || false
      this.signal = init.signal || null
    }

    clone() {
      return new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
        mode: this.mode,
        credentials: this.credentials,
        cache: this.cache,
        redirect: this.redirect,
        referrer: this.referrer,
        referrerPolicy: this.referrerPolicy,
        integrity: this.integrity,
        keepalive: this.keepalive,
        signal: this.signal
      })
    }

    async text() {
      return this.body || ''
    }

    async json() {
      return JSON.parse(await this.text())
    }
  }
}

// Mock location for URL manipulation tests - only in jsdom environment
if (typeof window !== 'undefined') {
  // Check if location is already configurable
  const descriptor = Object.getOwnPropertyDescriptor(window, 'location')
  if (!descriptor || descriptor.configurable) {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/',
        search: '',
        pathname: '/',
        protocol: 'http:',
        hostname: 'localhost',
        port: '3000',
        hash: '',
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
        assign: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn(),
        toString: jest.fn(),
      },
      writable: true,
      configurable: true,
    })
  }
}

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})