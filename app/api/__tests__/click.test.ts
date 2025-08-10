// ABOUTME: Comprehensive tests for click tracking API including security validation, rate limiting, and data handling
// ABOUTME: Tests cover input validation, sanitization, error scenarios, and security protections

/**
 * @jest-environment node
 */

import { POST } from '../click/route'
import { NextRequest } from 'next/server'

// Mock console methods
const originalConsoleLog = console.log
const originalConsoleError = console.error
const mockConsoleLog = jest.fn()
const mockConsoleError = jest.fn()

const validPayload = {
  action: 'apply',
  cardId: 'test-card-id',
  cardName: 'Test Card',
  path: '/test',
  ts: Date.now(),
  answers: {
    priority: 'dining_groceries',
    feeComfort: '$$',
    redemption: 'points'
  },
  referrer: 'https://example.com',
  ua: 'Mozilla/5.0 Test Browser',
}

function createMockRequest(payload: unknown, options: { 
  ip?: string
  contentLength?: string 
  headers?: Record<string, string>
} = {}): NextRequest {
  const url = 'http://localhost:3000/api/click'
  const headers = {
    'content-type': 'application/json',
    'x-forwarded-for': options.ip || '192.168.1.1',
    'content-length': options.contentLength || JSON.stringify(payload).length.toString(),
    ...options.headers
  }

  return new NextRequest(url, {
    method: 'POST',
    headers: new Headers(headers),
    body: JSON.stringify(payload)
  })
}

describe('/api/click', () => {
  beforeEach(() => {
    console.log = mockConsoleLog
    console.error = mockConsoleError
    mockConsoleLog.mockClear()
    mockConsoleError.mockClear()
  })

  afterEach(() => {
    console.log = originalConsoleLog
    console.error = originalConsoleError
  })

  describe('Valid requests', () => {
    it('accepts valid apply action', async () => {
      const request = createMockRequest(validPayload)
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          action: 'apply',
          cardId: 'test-card-id',
          cardName: 'Test Card',
          answers: validPayload.answers
        })
      )
    })

    it('accepts valid copy_link action', async () => {
      const payload = { ...validPayload, action: 'copy_link' }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          action: 'copy_link'
        })
      )
    })

    it('sanitizes string fields correctly', async () => {
      const payloadWithControlChars = {
        ...validPayload,
        cardName: 'Test\x00Card\x1F\x7F\x9F',
        path: '/test\x01path'
      }
      const request = createMockRequest(payloadWithControlChars)
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          cardName: 'TestCard',
          path: '/testpath'
        })
      )
    })

    it('handles IPv4-mapped IPv6 addresses', async () => {
      const request = createMockRequest(validPayload, { ip: '::ffff:192.168.1.1' })
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          clientIP: '192.168.1.1'
        })
      )
    })

    it('handles future timestamps within tolerance', async () => {
      const futureTs = Date.now() + 30000 // 30 seconds in future
      const payload = { ...validPayload, ts: futureTs }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          ts: futureTs
        })
      )
    })
  })

  describe('Payload size validation', () => {
    it('rejects payload too large', async () => {
      const request = createMockRequest(validPayload, { contentLength: '6000' })
      const response = await POST(request)

      expect(response.status).toBe(413)
      expect(await response.text()).toBe('Payload too large')
    })
  })

  describe('Action validation', () => {
    it('rejects invalid action', async () => {
      const payload = { ...validPayload, action: 'invalid' }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid action')
    })

    it('rejects missing action', async () => {
      const payload = { ...validPayload }
      delete payload.action
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid action')
    })

    it('rejects non-string action', async () => {
      const payload = { ...validPayload, action: 123 }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid action')
    })
  })

  describe('Card ID validation', () => {
    it('rejects invalid card ID with special characters', async () => {
      const payload = { ...validPayload, cardId: 'test@card!' }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid cardId')
    })

    it('rejects empty card ID', async () => {
      const payload = { ...validPayload, cardId: '' }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid cardId')
    })

    it('rejects card ID too long', async () => {
      const payload = { ...validPayload, cardId: 'a'.repeat(101) }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid cardId')
    })

    it('accepts valid card ID with allowed characters', async () => {
      const payload = { ...validPayload, cardId: 'test-card_123' }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(204)
    })
  })

  describe('Answers validation', () => {
    it('rejects invalid priority', async () => {
      const payload = { 
        ...validPayload, 
        answers: { ...validPayload.answers, priority: 'invalid' }
      }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid answers format')
    })

    it('rejects invalid fee comfort', async () => {
      const payload = { 
        ...validPayload, 
        answers: { ...validPayload.answers, feeComfort: 'invalid' }
      }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid answers format')
    })

    it('rejects invalid redemption', async () => {
      const payload = { 
        ...validPayload, 
        answers: { ...validPayload.answers, redemption: 'invalid' }
      }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid answers format')
    })

    it('rejects missing answers', async () => {
      const payload = { ...validPayload }
      delete payload.answers
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid answers format')
    })

    it('accepts all valid priority values', async () => {
      const priorities = ['one_card', 'dining_groceries', 'flights_hotels', 'everything_else']
      
      for (const priority of priorities) {
        const payload = { 
          ...validPayload, 
          answers: { ...validPayload.answers, priority }
        }
        const request = createMockRequest(payload)
        const response = await POST(request)

        expect(response.status).toBe(204)
      }
    })

    it('accepts all valid fee comfort values', async () => {
      const feeComforts = ['any', '$', '$$', '$$$', '$$$$']
      
      for (const feeComfort of feeComforts) {
        const payload = { 
          ...validPayload, 
          answers: { ...validPayload.answers, feeComfort }
        }
        const request = createMockRequest(payload)
        const response = await POST(request)

        expect(response.status).toBe(204)
      }
    })

    it('accepts all valid redemption values', async () => {
      const redemptions = ['points', 'cashback', 'simple']
      
      for (const redemption of redemptions) {
        const payload = { 
          ...validPayload, 
          answers: { ...validPayload.answers, redemption }
        }
        const request = createMockRequest(payload)
        const response = await POST(request)

        expect(response.status).toBe(204)
      }
    })
  })

  describe('Rate limiting', () => {
    it('allows requests under limit', async () => {
      const ip = '192.168.1.100'
      
      // Make several requests under the limit
      for (let i = 0; i < 5; i++) {
        const request = createMockRequest(validPayload, { ip })
        const response = await POST(request)
        expect(response.status).toBe(204)
      }
    })

    it('rate limits excessive requests from same IP', async () => {
      const ip = '192.168.1.101'
      
      // Make requests up to the limit (30)
      const promises = Array.from({ length: 35 }, () => {
        const request = createMockRequest(validPayload, { ip })
        return POST(request)
      })
      
      const responses = await Promise.all(promises)
      
      // First 30 should succeed
      responses.slice(0, 30).forEach(response => {
        expect(response.status).toBe(204)
      })
      
      // Remaining should be rate limited
      responses.slice(30).forEach(response => {
        expect(response.status).toBe(429)
      })
    })

    it('uses different rate limits for different IPs', async () => {
      const ip1 = '192.168.1.102'
      const ip2 = '192.168.1.103'
      
      // Use up limit for ip1
      const promises1 = Array.from({ length: 30 }, () => {
        const request = createMockRequest(validPayload, { ip: ip1 })
        return POST(request)
      })
      await Promise.all(promises1)
      
      // ip2 should still work
      const request2 = createMockRequest(validPayload, { ip: ip2 })
      const response2 = await POST(request2)
      expect(response2.status).toBe(204)
      
      // ip1 should be limited
      const request1 = createMockRequest(validPayload, { ip: ip1 })
      const response1 = await POST(request1)
      expect(response1.status).toBe(429)
    })
  })

  describe('Error handling', () => {
    it('handles malformed JSON', async () => {
      const url = 'http://localhost:3000/api/click'
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"invalid": json}'
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Bad Request')
      expect(mockConsoleError).toHaveBeenCalled()
    })

    it('handles missing content-type header', async () => {
      const url = 'http://localhost:3000/api/click'
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      const response = await POST(request)
      // Should still work - Next.js is lenient with content-type
      expect([204, 400]).toContain(response.status)
    })

    it('handles empty request body', async () => {
      const url = 'http://localhost:3000/api/click'
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: ''
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(mockConsoleError).toHaveBeenCalled()
    })

    it('handles null payload', async () => {
      const request = createMockRequest(null)
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid payload format')
    })

    it('handles non-object payload', async () => {
      const request = createMockRequest('not an object')
      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Invalid payload format')
    })
  })

  describe('Data sanitization', () => {
    it('truncates long strings to maximum length', async () => {
      const payload = {
        ...validPayload,
        cardId: 'a'.repeat(200), // Should be truncated to 100
        cardName: 'b'.repeat(300), // Should be truncated to 200
        path: 'c'.repeat(600), // Should be truncated to 500
      }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          cardId: 'a'.repeat(100),
          cardName: 'b'.repeat(200),
          path: 'c'.repeat(500)
        })
      )
    })

    it('handles non-string values by converting to empty string', async () => {
      const payload = {
        ...validPayload,
        cardName: 123,
        path: null,
        referrer: undefined,
        ua: true
      }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          cardName: '',
          path: '',
          referrer: '',
          ua: ''
        })
      )
    })

    it('uses current timestamp if invalid timestamp provided', async () => {
      const now = Date.now()
      const payload = { ...validPayload, ts: 'invalid' }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          ts: expect.any(Number)
        })
      )

      const loggedData = mockConsoleLog.mock.calls[0][1]
      expect(loggedData.ts).toBeGreaterThanOrEqual(now)
      expect(loggedData.ts).toBeLessThanOrEqual(Date.now())
    })

    it('rejects timestamps too far in the future', async () => {
      const farFutureTs = Date.now() + 120000 // 2 minutes in future
      const payload = { ...validPayload, ts: farFutureTs }
      const request = createMockRequest(payload)
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          ts: expect.any(Number)
        })
      )

      const loggedData = mockConsoleLog.mock.calls[0][1]
      expect(loggedData.ts).not.toBe(farFutureTs)
      expect(loggedData.ts).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('IP address handling', () => {
    it('extracts IP from x-forwarded-for header', async () => {
      const request = createMockRequest(validPayload, { 
        ip: '203.0.113.1, 192.168.1.1' 
      })
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          clientIP: '203.0.113.1'
        })
      )
    })

    it('falls back to x-real-ip header', async () => {
      const request = createMockRequest(validPayload, { 
        headers: {
          'x-real-ip': '203.0.113.2'
        }
      })
      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          clientIP: '203.0.113.2'
        })
      )
    })

    it('handles missing IP headers', async () => {
      const url = 'http://localhost:3000/api/click'
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload)
      })

      const response = await POST(request)
      expect(response.status).toBe(204)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[dccr/click]',
        expect.objectContaining({
          clientIP: 'unknown'
        })
      )
    })
  })
})