// ABOUTME: Comprehensive unit tests for utility functions including scoring, URL handling, and security validation
// ABOUTME: Tests cover edge cases, security scenarios, and business logic correctness

import { renderHook, act } from '@testing-library/react'
import { 
  useDebounce, 
  scoreCard, 
  buildShareURL, 
  parseAnswersFromURL, 
  validateReferralUrl, 
  trackClick 
} from '../utils'
import { Card, Answers } from '../types'

// Mock card data for testing
const mockCard: Card = {
  id: 'test-card',
  name: 'Test Card',
  issuer: 'Test Bank',
  headline: 'Great test card',
  highlights: ['Reward 1', 'Reward 2'],
  annualFee: '$$',
  recommendedFor: ['dining_groceries', 'flights_hotels'],
  flavor: 'points',
  simplicity: 3,
  referralUrl: 'https://chase.com/test-referral',
  featured: true
}

const mockAnswers: Answers = {
  priority: 'dining_groceries',
  feeComfort: '$$',
  redemption: 'points'
}

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial') // Should still be initial

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('should cancel previous timeout when value changes quickly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'first' })
    act(() => {
      jest.advanceTimersByTime(250)
    })
    expect(result.current).toBe('initial')

    rerender({ value: 'second' })
    act(() => {
      jest.advanceTimersByTime(250)
    })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(250)
    })
    expect(result.current).toBe('second')
  })
})

describe('scoreCard', () => {
  it('should give base points for matching priority', () => {
    const score = scoreCard(mockCard, mockAnswers)
    expect(score).toBeGreaterThanOrEqual(10) // Base 10 points for matching priority
  })

  it('should give no base points for non-matching priority', () => {
    const answers: Answers = { ...mockAnswers, priority: 'one_card' }
    const score = scoreCard(mockCard, answers)
    expect(score).toBeLessThan(10) // No base points
  })

  it('should calculate fee score correctly for exact match', () => {
    const answers: Answers = { ...mockAnswers, feeComfort: '$$' }
    const score = scoreCard(mockCard, answers)
    const noMatchAnswers: Answers = { ...mockAnswers, feeComfort: '$$$$' }
    const noMatchScore = scoreCard(mockCard, noMatchAnswers)
    
    expect(score).toBeGreaterThan(noMatchScore)
  })

  it('should handle "any" fee comfort preference', () => {
    const answers: Answers = { ...mockAnswers, feeComfort: 'any' }
    const score = scoreCard(mockCard, answers)
    expect(score).toBeGreaterThan(0) // Should get some fee bonus
  })

  it('should score redemption preference correctly', () => {
    // Test points preference match
    const pointsAnswers: Answers = { ...mockAnswers, redemption: 'points' }
    const pointsScore = scoreCard(mockCard, pointsAnswers)
    
    // Test cashback preference (no match)
    const cashbackAnswers: Answers = { ...mockAnswers, redemption: 'cashback' }
    const cashbackScore = scoreCard(mockCard, cashbackAnswers)
    
    expect(pointsScore).toBeGreaterThan(cashbackScore)
  })

  it('should handle simplicity preference correctly', () => {
    const simpleCard: Card = { ...mockCard, simplicity: 4 }
    const complexCard: Card = { ...mockCard, simplicity: 1 }
    
    const simpleAnswers: Answers = { ...mockAnswers, redemption: 'simple' }
    
    const simpleScore = scoreCard(simpleCard, simpleAnswers)
    const complexScore = scoreCard(complexCard, simpleAnswers)
    
    expect(simpleScore).toBeGreaterThan(complexScore)
  })

  it('should add featured bonus correctly', () => {
    const featuredCard: Card = { ...mockCard, featured: true }
    const nonFeaturedCard: Card = { ...mockCard, featured: false }
    
    const featuredScore = scoreCard(featuredCard, mockAnswers)
    const nonFeaturedScore = scoreCard(nonFeaturedCard, mockAnswers)
    
    expect(featuredScore).toBe(nonFeaturedScore + 1)
  })

  it('should handle undefined featured property', () => {
    const card: Card = { ...mockCard }
    delete card.featured
    
    expect(() => scoreCard(card, mockAnswers)).not.toThrow()
  })
})

describe('buildShareURL', () => {
  it('should build URL with correct parameters', () => {
    // Mock window.location.href using Object.defineProperty
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: 'http://localhost:3000/'
      },
      writable: true,
      configurable: true
    })
    
    const url = buildShareURL(mockAnswers)
    const parsed = new URL(url)
    
    expect(parsed.searchParams.get('w')).toBe('1')
    expect(parsed.searchParams.get('p')).toBe('dining_groceries')
    expect(parsed.searchParams.get('f')).toBe('$$')
    expect(parsed.searchParams.get('r')).toBe('points')
    
    // Restore original
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    })
  })

  it('should preserve existing URL structure', () => {
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: 'http://localhost:3000/test?existing=param'
      },
      writable: true,
      configurable: true
    })
    
    const url = buildShareURL(mockAnswers)
    const parsed = new URL(url)
    
    expect(parsed.pathname).toBe('/test')
    expect(parsed.searchParams.get('existing')).toBe('param')
    expect(parsed.searchParams.get('w')).toBe('1')
    
    // Restore original
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    })
  })
})

describe('parseAnswersFromURL', () => {
  const mockLocation = (search: string) => {
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        search
      },
      writable: true,
      configurable: true
    })
    return originalLocation
  }

  it('should return null when no wizard parameter', () => {
    const original = mockLocation('?p=dining_groceries')
    expect(parseAnswersFromURL()).toBeNull()
    Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
  })

  it('should return null when wizard parameter is not "1"', () => {
    const original = mockLocation('?w=0&p=dining_groceries')
    expect(parseAnswersFromURL()).toBeNull()
    Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
  })

  it('should parse valid parameters correctly', () => {
    const original = mockLocation('?w=1&p=dining_groceries&f=$$&r=points')
    const result = parseAnswersFromURL()
    
    expect(result).toEqual({
      priority: 'dining_groceries',
      feeComfort: '$$',
      redemption: 'points'
    })
    Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
  })

  it('should return null for invalid priority', () => {
    const original = mockLocation('?w=1&p=invalid_category&f=$$&r=points')
    expect(parseAnswersFromURL()).toBeNull()
    Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
  })

  it('should return null for invalid fee comfort', () => {
    const original = mockLocation('?w=1&p=dining_groceries&f=invalid&r=points')
    expect(parseAnswersFromURL()).toBeNull()
    Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
  })

  it('should return null for invalid redemption', () => {
    const original = mockLocation('?w=1&p=dining_groceries&f=$$&r=invalid')
    expect(parseAnswersFromURL()).toBeNull()
    Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
  })

  it('should handle missing parameters', () => {
    const original = mockLocation('?w=1&p=dining_groceries')
    expect(parseAnswersFromURL()).toBeNull()
    Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
  })
})

describe('validateReferralUrl', () => {
  it('should validate allowed domains', () => {
    expect(validateReferralUrl('https://americanexpress.com/card')).toBe(true)
    expect(validateReferralUrl('https://chase.com/sapphire')).toBe(true)
    expect(validateReferralUrl('https://capitalone.com/venture')).toBe(true)
    expect(validateReferralUrl('https://citi.com/premier')).toBe(true)
    expect(validateReferralUrl('https://bankofamerica.com/travel')).toBe(true)
  })

  it('should validate subdomains of allowed domains', () => {
    expect(validateReferralUrl('https://creditcards.chase.com/sapphire')).toBe(true)
    expect(validateReferralUrl('https://secure.americanexpress.com/card')).toBe(true)
    expect(validateReferralUrl('https://apply.capitalone.com/venture')).toBe(true)
  })

  it('should reject non-allowed domains', () => {
    expect(validateReferralUrl('https://malicious.com/phishing')).toBe(false)
    expect(validateReferralUrl('https://fake-chase.com/card')).toBe(false)
    expect(validateReferralUrl('https://chase-fake.com/card')).toBe(false)
  })

  it('should reject invalid URLs', () => {
    expect(validateReferralUrl('not-a-url')).toBe(false)
    expect(validateReferralUrl('')).toBe(false)
    expect(validateReferralUrl('javascript:alert("xss")')).toBe(false)
  })

  it('should handle URLs with different protocols', () => {
    expect(validateReferralUrl('http://chase.com/card')).toBe(true)
    expect(validateReferralUrl('ftp://chase.com/card')).toBe(true)
  })

  it('should be case sensitive for security', () => {
    expect(validateReferralUrl('https://Chase.com/card')).toBe(false)
    expect(validateReferralUrl('https://AMERICANEXPRESS.COM/card')).toBe(false)
  })
})

describe('trackClick', () => {
  let mockSendBeacon: jest.Mock

  beforeEach(() => {
    mockSendBeacon = jest.fn().mockReturnValue(true)
    Object.defineProperty(navigator, 'sendBeacon', {
      value: mockSendBeacon,
      writable: true,
    })

    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        pathname: '/test',
        search: '?param=value'
      },
      writable: true,
      configurable: true
    })
  })

  it('should track apply action correctly', () => {
    trackClick('apply', mockCard, mockAnswers)

    expect(mockSendBeacon).toHaveBeenCalledWith(
      '/api/click',
      expect.any(Blob)
    )

    // Check blob content
    const call = mockSendBeacon.mock.calls[0]
    const blob = call[1]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/json')
  })

  it('should track copy_link action correctly', () => {
    trackClick('copy_link', mockCard, mockAnswers)

    expect(mockSendBeacon).toHaveBeenCalledTimes(1)
    expect(mockSendBeacon).toHaveBeenCalledWith(
      '/api/click',
      expect.any(Blob)
    )
  })

  it('should include all required tracking data', async () => {
    trackClick('apply', mockCard, mockAnswers)

    const call = mockSendBeacon.mock.calls[0]
    const blob = call[1]
    const text = await blob.text()
    const payload = JSON.parse(text)

    expect(payload).toMatchObject({
      action: 'apply',
      cardId: 'test-card',
      cardName: 'Test Card',
      path: '/test?param=value',
      answers: mockAnswers,
    })
    expect(payload.ts).toBeGreaterThan(0)
    expect(payload.ua).toContain('Test Browser')
  })

  it('should handle sendBeacon failure gracefully', () => {
    mockSendBeacon.mockReturnValue(false)
    
    expect(() => {
      trackClick('apply', mockCard, mockAnswers)
    }).not.toThrow()
  })

  it('should handle missing browser APIs gracefully', () => {
    delete (navigator as unknown as { sendBeacon?: unknown }).sendBeacon

    expect(() => {
      trackClick('apply', mockCard, mockAnswers)
    }).not.toThrow()
  })
})

describe('Edge cases and error handling', () => {
  it('should handle scoreCard with malformed card data', () => {
    const malformedCard = {
      ...mockCard,
      recommendedFor: undefined as unknown as string[],
      annualFee: 'invalid' as unknown as string,
    }

    // Should not throw, but may return unexpected scores
    expect(() => scoreCard(malformedCard, mockAnswers)).not.toThrow()
  })

  it('should handle scoreCard with malformed answers', () => {
    const malformedAnswers = {
      priority: 'invalid' as unknown as string,
      feeComfort: undefined as unknown as string,
      redemption: 'invalid' as unknown as string,
    }

    // Should not throw, but may return unexpected scores
    expect(() => scoreCard(mockCard, malformedAnswers)).not.toThrow()
  })

  it('should handle URL parsing with malformed search params', () => {
    const original = window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...original,
        search: '?w=1&p=&f=&r='
      },
      writable: true,
      configurable: true
    })
    
    expect(parseAnswersFromURL()).toBeNull()
    
    Object.defineProperty(window, 'location', {
      value: original,
      writable: true,
      configurable: true
    })
  })
})