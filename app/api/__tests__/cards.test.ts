// ABOUTME: Tests for cards API endpoint covering JSON response, data structure, and error handling
// ABOUTME: Validates card catalog data integrity and response format correctness

/**
 * @jest-environment node
 */

import { GET } from '../cards/route'
import cardsData from '@/data/cards.json'

describe('/api/cards', () => {
  it('returns cards data as JSON', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toMatch(/application\/json/)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toEqual(cardsData)
  })

  it('returns valid card objects with required properties', async () => {
    const response = await GET()
    const cards = await response.json()
    
    expect(cards.length).toBeGreaterThan(0)
    
    cards.forEach((card: any, index: number) => {
      expect(card).toHaveProperty('id')
      expect(card).toHaveProperty('name')
      expect(card).toHaveProperty('issuer')
      expect(card).toHaveProperty('headline')
      expect(card).toHaveProperty('highlights')
      expect(card).toHaveProperty('annualFee')
      expect(card).toHaveProperty('recommendedFor')
      expect(card).toHaveProperty('flavor')
      expect(card).toHaveProperty('simplicity')
      expect(card).toHaveProperty('referralUrl')
      
      expect(typeof card.id).toBe('string')
      expect(typeof card.name).toBe('string')
      expect(typeof card.issuer).toBe('string')
      expect(typeof card.headline).toBe('string')
      expect(Array.isArray(card.highlights)).toBe(true)
      expect(Array.isArray(card.recommendedFor)).toBe(true)
      expect(['points', 'cashback']).toContain(card.flavor)
      expect(typeof card.simplicity).toBe('number')
      expect(card.simplicity).toBeGreaterThanOrEqual(1)
      expect(card.simplicity).toBeLessThanOrEqual(4)
      expect(typeof card.referralUrl).toBe('string')
      expect(['$', '$$', '$$$', '$$$$']).toContain(card.annualFee)
    })
  })

  it('contains valid category recommendations', async () => {
    const response = await GET()
    const cards = await response.json()
    
    const validCategories = ['one_card', 'dining_groceries', 'flights_hotels', 'everything_else']
    
    cards.forEach((card: any) => {
      card.recommendedFor.forEach((category: string) => {
        expect(validCategories).toContain(category)
      })
    })
  })

  it('contains valid referral URLs', async () => {
    const response = await GET()
    const cards = await response.json()
    
    cards.forEach((card: any) => {
      expect(card.referralUrl).toMatch(/^https?:\/\//)
    })
  })

  it('has unique card IDs', async () => {
    const response = await GET()
    const cards = await response.json()
    
    const ids = cards.map((card: any) => card.id)
    const uniqueIds = new Set(ids)
    
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('maintains data consistency with imported JSON', async () => {
    const response = await GET()
    const apiCards = await response.json()
    
    expect(apiCards).toStrictEqual(cardsData)
  })

  it('handles concurrent requests properly', async () => {
    const promises = Array.from({ length: 10 }, () => GET())
    const responses = await Promise.all(promises)
    
    responses.forEach(response => {
      expect(response.status).toBe(200)
    })
    
    const data = await Promise.all(responses.map(r => r.json()))
    data.forEach(cards => {
      expect(cards).toEqual(cardsData)
    })
  })
})