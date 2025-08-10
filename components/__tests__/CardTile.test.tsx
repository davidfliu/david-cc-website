// ABOUTME: Comprehensive tests for CardTile component including security validation, user interactions, and accessibility
// ABOUTME: Tests cover referral link validation, click tracking, toast notifications, and proper UI states

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardTile } from '../CardTile'
import { ToastProvider } from '../Toast'
import { Card, Answers } from '../types'
import * as utils from '../utils'

// Mock the utils module
jest.mock('../utils', () => ({
  validateReferralUrl: jest.fn(),
  trackClick: jest.fn(),
}))

const mockValidateReferralUrl = utils.validateReferralUrl as jest.MockedFunction<typeof utils.validateReferralUrl>
const mockTrackClick = utils.trackClick as jest.MockedFunction<typeof utils.trackClick>

const mockCard: Card = {
  id: 'test-card',
  name: 'Test Rewards Card',
  issuer: 'Test Bank',
  headline: 'Earn great rewards on everything',
  highlights: [
    '3x points on dining and groceries',
    '2x points on gas and travel',
    'No foreign transaction fees'
  ],
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

// Test wrapper with ToastProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('CardTile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateReferralUrl.mockReturnValue(true)
  })

  it('renders card information correctly', () => {
    render(
      <TestWrapper>
        <CardTile card={mockCard} answers={mockAnswers} />
      </TestWrapper>
    )

    expect(screen.getByText('Test Rewards Card')).toBeInTheDocument()
    expect(screen.getByText('Test Bank')).toBeInTheDocument()
    expect(screen.getByText('Earn great rewards on everything')).toBeInTheDocument()
    expect(screen.getByText('3x points on dining and groceries')).toBeInTheDocument()
    expect(screen.getByText('2x points on gas and travel')).toBeInTheDocument()
    expect(screen.getByText('No foreign transaction fees')).toBeInTheDocument()
  })

  it('displays featured badge when card is featured', () => {
    render(
      <TestWrapper>
        <CardTile card={mockCard} answers={mockAnswers} />
      </TestWrapper>
    )

    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('does not display featured badge when card is not featured', () => {
    const nonFeaturedCard = { ...mockCard, featured: false }
    render(
      <TestWrapper>
        <CardTile card={nonFeaturedCard} answers={mockAnswers} />
      </TestWrapper>
    )

    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })

  it('renders FeePill component', () => {
    render(
      <TestWrapper>
        <CardTile card={mockCard} answers={mockAnswers} />
      </TestWrapper>
    )

    // FeePill should be rendered - we'll test specific fee display in FeePill tests
    expect(document.querySelector('.fee-pill') || document.querySelector('[data-testid="fee-pill"]')).toBeTruthy()
  })

  describe('Valid referral URL functionality', () => {
    beforeEach(() => {
      mockValidateReferralUrl.mockReturnValue(true)
    })

    it('renders apply button with correct attributes when URL is valid', () => {
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const applyButton = screen.getByRole('link', { name: /apply for test rewards card via referral link/i })
      
      expect(applyButton).toHaveAttribute('href', 'https://chase.com/test-referral')
      expect(applyButton).toHaveAttribute('target', '_blank')
      expect(applyButton).toHaveAttribute('rel', 'noreferrer')
      expect(applyButton).not.toHaveClass('cursor-not-allowed')
    })

    it('renders copy link button as enabled when URL is valid', () => {
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      
      expect(copyButton).not.toBeDisabled()
      expect(copyButton).not.toHaveClass('cursor-not-allowed')
    })

    it('tracks click when apply button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const applyButton = screen.getByRole('link', { name: /apply for test rewards card via referral link/i })
      await user.click(applyButton)

      expect(mockTrackClick).toHaveBeenCalledWith('apply', mockCard, mockAnswers)
    })

    it('copies referral URL when copy button is clicked', async () => {
      const user = userEvent.setup()
      const mockWriteText = jest.fn().mockResolvedValue(undefined)
      
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })
      
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      await user.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith('https://chase.com/test-referral')
      expect(mockTrackClick).toHaveBeenCalledWith('copy_link', mockCard, mockAnswers)
    })

    it('shows success toast when copy is successful', async () => {
      const user = userEvent.setup()
      const mockWriteText = jest.fn().mockResolvedValue(undefined)
      
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })
      
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Test Rewards Card referral link copied!')).toBeInTheDocument()
      })
    })

    it('shows error toast when copy fails', async () => {
      const user = userEvent.setup()
      const mockWriteText = jest.fn().mockRejectedValue(new Error('Copy failed'))
      
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })
      
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to copy link. Please try again.')).toBeInTheDocument()
      })
    })
  })

  describe('Invalid referral URL security handling', () => {
    beforeEach(() => {
      mockValidateReferralUrl.mockReturnValue(false)
    })

    it('renders apply button as disabled when URL is invalid', () => {
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const applyButton = screen.getByRole('link', { name: /apply for test rewards card via referral link/i })
      
      expect(applyButton).toHaveAttribute('href', '#')
      expect(applyButton).not.toHaveAttribute('target')
      expect(applyButton).not.toHaveAttribute('rel')
      expect(applyButton).toHaveClass('cursor-not-allowed')
    })

    it('renders copy link button as disabled when URL is invalid', () => {
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      
      expect(copyButton).toBeDisabled()
      expect(copyButton).toHaveClass('cursor-not-allowed')
    })

    it('prevents navigation and shows error toast when invalid apply link is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const applyButton = screen.getByRole('link', { name: /apply for test rewards card via referral link/i })
      
      // Click the link
      await user.click(applyButton)

      // Should not track the click
      expect(mockTrackClick).not.toHaveBeenCalled()
      
      // Should show error toast
      await waitFor(() => {
        expect(screen.getByText('Invalid referral link. Please contact support.')).toBeInTheDocument()
      })
    })

    it('shows error toast when invalid copy button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid referral link. Please contact support.')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const applyButton = screen.getByRole('link', { name: /apply for test rewards card via referral link/i })
      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      
      expect(applyButton).toBeInTheDocument()
      expect(copyButton).toBeInTheDocument()
    })

    it('has proper focus management', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const applyButton = screen.getByRole('link', { name: /apply for test rewards card via referral link/i })
      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      
      // Tab navigation should work
      await user.tab()
      expect(applyButton).toHaveFocus()
      
      await user.tab()
      expect(copyButton).toHaveFocus()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      const mockWriteText = jest.fn().mockResolvedValue(undefined)
      
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })
      
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      
      // Focus and press Enter
      copyButton.focus()
      await user.keyboard('{Enter}')

      expect(mockWriteText).toHaveBeenCalledWith('https://chase.com/test-referral')
    })
  })

  describe('Edge cases', () => {
    it('handles missing clipboard API gracefully', async () => {
      const user = userEvent.setup()
      
      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      })
      
      render(
        <TestWrapper>
          <CardTile card={mockCard} answers={mockAnswers} />
        </TestWrapper>
      )

      const copyButton = screen.getByRole('button', { name: /copy referral link for test rewards card/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to copy link. Please try again.')).toBeInTheDocument()
      })
    })

    it('handles card without featured property', () => {
      const cardWithoutFeatured = { ...mockCard }
      delete cardWithoutFeatured.featured
      
      expect(() => {
        render(
          <TestWrapper>
            <CardTile card={cardWithoutFeatured} answers={mockAnswers} />
          </TestWrapper>
        )
      }).not.toThrow()
    })

    it('renders with empty highlights array', () => {
      const cardWithNoHighlights = { ...mockCard, highlights: [] }
      
      render(
        <TestWrapper>
          <CardTile card={cardWithNoHighlights} answers={mockAnswers} />
        </TestWrapper>
      )

      expect(screen.getByText('Test Rewards Card')).toBeInTheDocument()
    })
  })
})