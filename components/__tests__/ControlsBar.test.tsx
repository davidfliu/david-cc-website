// ABOUTME: Tests for ControlsBar component covering search functionality and fee filtering
// ABOUTME: Includes input handling, button states, accessibility, and responsive behavior

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ControlsBar } from '../ControlsBar'

const mockSetQuery = jest.fn()
const mockSetFeeBand = jest.fn()

const defaultProps = {
  query: '',
  setQuery: mockSetQuery,
  feeBand: '',
  setFeeBand: mockSetFeeBand,
}

describe('ControlsBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial rendering', () => {
    it('renders search input and fee filter buttons', () => {
      render(<ControlsBar {...defaultProps} />)

      expect(screen.getByPlaceholderText('Search cards (name, issuer)')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter by all fees annual fee range/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter by \$0–\$95 annual fee range/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter by \$95–\$199 annual fee range/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter by \$200–\$395 annual fee range/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter by \$400\+ annual fee range/i })).toBeInTheDocument()
    })

    it('displays search icon', () => {
      render(<ControlsBar {...defaultProps} />)

      expect(screen.getByText('🔍')).toBeInTheDocument()
    })

    it('shows correct initial state for fee bands', () => {
      render(<ControlsBar {...defaultProps} />)

      const allFeesButton = screen.getByRole('button', { name: /filter by all fees annual fee range/i })
      expect(allFeesButton).toHaveAttribute('aria-pressed', 'true')
      expect(allFeesButton).toHaveClass('bg-zinc-900', 'text-white')
    })
  })

  describe('Search functionality', () => {
    it('calls setQuery when search input changes', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search cards (name, issuer)')
      await user.type(searchInput, 'chase')

      expect(mockSetQuery).toHaveBeenCalledWith('c')
      expect(mockSetQuery).toHaveBeenCalledWith('ch')
      expect(mockSetQuery).toHaveBeenCalledWith('cha')
      expect(mockSetQuery).toHaveBeenCalledWith('chas')
      expect(mockSetQuery).toHaveBeenCalledWith('chase')
    })

    it('displays current query value', () => {
      render(<ControlsBar {...defaultProps} query="sapphire" />)

      const searchInput = screen.getByPlaceholderText('Search cards (name, issuer)') as HTMLInputElement
      expect(searchInput.value).toBe('sapphire')
    })

    it('clears search when input is cleared', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} query="test" />)

      const searchInput = screen.getByPlaceholderText('Search cards (name, issuer)')
      await user.clear(searchInput)

      expect(mockSetQuery).toHaveBeenCalledWith('')
    })

    it('has proper accessibility attributes for search input', () => {
      render(<ControlsBar {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search cards (name, issuer)')
      expect(searchInput).toHaveAttribute('aria-label', 'Search credit cards by name or issuer')
    })
  })

  describe('Fee filtering functionality', () => {
    it('calls setFeeBand when fee filter button is clicked', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} />)

      const midTierButton = screen.getByRole('button', { name: /filter by \$95–\$199 annual fee range/i })
      await user.click(midTierButton)

      expect(mockSetFeeBand).toHaveBeenCalledWith('$$')
    })

    it('shows correct active state for selected fee band', () => {
      render(<ControlsBar {...defaultProps} feeBand="$$" />)

      const midTierButton = screen.getByRole('button', { name: /filter by \$95–\$199 annual fee range/i })
      const allFeesButton = screen.getByRole('button', { name: /filter by all fees annual fee range/i })

      expect(midTierButton).toHaveAttribute('aria-pressed', 'true')
      expect(midTierButton).toHaveClass('bg-zinc-900', 'text-white')
      
      expect(allFeesButton).toHaveAttribute('aria-pressed', 'false')
      expect(allFeesButton).toHaveClass('border', 'border-zinc-300', 'text-zinc-700')
    })

    it('allows switching between different fee bands', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} feeBand="$$" />)

      const highTierButton = screen.getByRole('button', { name: /filter by \$200–\$395 annual fee range/i })
      await user.click(highTierButton)

      expect(mockSetFeeBand).toHaveBeenCalledWith('$$$')
    })

    it('can reset to show all fees', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} feeBand="$$" />)

      const allFeesButton = screen.getByRole('button', { name: /filter by all fees annual fee range/i })
      await user.click(allFeesButton)

      expect(mockSetFeeBand).toHaveBeenCalledWith('')
    })

    it('has proper ARIA labels for all fee filter buttons', () => {
      render(<ControlsBar {...defaultProps} />)

      const buttons = [
        { text: 'All fees', key: '' },
        { text: '$0–$95', key: '$' },
        { text: '$95–$199', key: '$$' },
        { text: '$200–$395', key: '$$$' },
        { text: '$400+', key: '$$$$' },
      ]

      buttons.forEach(({ text }) => {
        const button = screen.getByRole('button', { name: new RegExp(`filter by ${text.replace(/\$/g, '\\$').replace(/\+/, '\\+')} annual fee range`, 'i') })
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard navigation', () => {
    it('supports tab navigation between search input and buttons', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search cards (name, issuer)')
      const allFeesButton = screen.getByRole('button', { name: /filter by all fees annual fee range/i })

      // Tab from search to first fee button
      searchInput.focus()
      await user.tab()

      expect(allFeesButton).toHaveFocus()
    })

    it('supports Enter key on fee filter buttons', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} />)

      const midTierButton = screen.getByRole('button', { name: /filter by \$95–\$199 annual fee range/i })
      midTierButton.focus()
      await user.keyboard('{Enter}')

      expect(mockSetFeeBand).toHaveBeenCalledWith('$$')
    })

    it('supports Space key on fee filter buttons', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} />)

      const midTierButton = screen.getByRole('button', { name: /filter by \$95–\$199 annual fee range/i })
      midTierButton.focus()
      await user.keyboard(' ')

      expect(mockSetFeeBand).toHaveBeenCalledWith('$$')
    })
  })

  describe('Focus management', () => {
    it('maintains focus ring styles on search input', () => {
      render(<ControlsBar {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search cards (name, issuer)')
      expect(searchInput).toHaveClass('focus:ring-2', 'focus:ring-zinc-300', 'focus:ring-offset-2')
    })

    it('maintains focus ring styles on fee filter buttons', () => {
      render(<ControlsBar {...defaultProps} />)

      const allFeesButton = screen.getByRole('button', { name: /filter by all fees annual fee range/i })
      expect(allFeesButton).toHaveClass('focus:ring-2', 'focus:ring-zinc-300', 'focus:ring-offset-2')
    })
  })

  describe('Responsive behavior', () => {
    it('has responsive layout classes', () => {
      render(<ControlsBar {...defaultProps} />)

      // Main container should have responsive flex classes
      const container = screen.getByPlaceholderText('Search cards (name, issuer)').closest('.rounded-2xl')
      expect(container).toHaveClass('md:flex-row', 'md:items-center', 'md:justify-between')
    })

    it('has flex-wrap for fee filter buttons on mobile', () => {
      render(<ControlsBar {...defaultProps} />)

      // Fee filter container should wrap on mobile
      const feeContainer = screen.getByRole('button', { name: /filter by all fees annual fee range/i }).parentElement
      expect(feeContainer).toHaveClass('flex-wrap')
    })
  })

  describe('Visual feedback', () => {
    it('shows hover states for inactive fee filter buttons', () => {
      render(<ControlsBar {...defaultProps} />)

      const dollarButton = screen.getByRole('button', { name: /filter by \$0–\$95 annual fee range/i })
      expect(dollarButton).toHaveClass('hover:bg-zinc-50')
    })

    it('uses different styles for active vs inactive fee buttons', () => {
      render(<ControlsBar {...defaultProps} feeBand="$$" />)

      const activeButton = screen.getByRole('button', { name: /filter by \$95–\$199 annual fee range/i })
      const inactiveButton = screen.getByRole('button', { name: /filter by \$0–\$95 annual fee range/i })

      // Active button
      expect(activeButton).toHaveClass('bg-zinc-900', 'text-white')
      expect(activeButton).not.toHaveClass('border', 'border-zinc-300')

      // Inactive button
      expect(inactiveButton).toHaveClass('border', 'border-zinc-300', 'text-zinc-700')
      expect(inactiveButton).not.toHaveClass('bg-zinc-900')
    })
  })

  describe('Edge cases', () => {
    it('handles special characters in search input', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search cards (name, issuer)')
      await user.type(searchInput, 'Card & Bank!')

      expect(mockSetQuery).toHaveBeenCalledWith('Card & Bank!')
    })

    it('handles empty string for feeBand prop', () => {
      render(<ControlsBar {...defaultProps} feeBand="" />)

      const allFeesButton = screen.getByRole('button', { name: /filter by all fees annual fee range/i })
      expect(allFeesButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('handles very long search query', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} />)

      const longQuery = 'A'.repeat(1000)
      const searchInput = screen.getByPlaceholderText('Search cards (name, issuer)')
      await user.type(searchInput, longQuery)

      expect(mockSetQuery).toHaveBeenCalledWith(longQuery)
    })

    it('handles rapid clicking on fee filter buttons', async () => {
      const user = userEvent.setup()
      render(<ControlsBar {...defaultProps} />)

      const midTierButton = screen.getByRole('button', { name: /filter by \$95–\$199 annual fee range/i })
      
      // Rapid clicks
      await user.click(midTierButton)
      await user.click(midTierButton)
      await user.click(midTierButton)

      expect(mockSetFeeBand).toHaveBeenCalledTimes(3)
      expect(mockSetFeeBand).toHaveBeenCalledWith('$$')
    })
  })
})