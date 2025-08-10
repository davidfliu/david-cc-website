// ABOUTME: Comprehensive tests for Wizard component covering 3-step flow, keyboard navigation, and form validation
// ABOUTME: Tests include step progression, answer persistence, accessibility features, and completion callbacks

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Wizard } from '../Wizard'
import { Answers } from '../types'

const mockOnDone = jest.fn()

const initialAnswers: Answers = {
  priority: 'one_card',
  feeComfort: 'any',
  redemption: 'simple'
}

describe('Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock focus management
    HTMLElement.prototype.focus = jest.fn()
  })

  describe('Initial rendering and structure', () => {
    it('renders wizard modal with correct initial state', () => {
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Quick Start • Step 1 of 3')).toBeInTheDocument()
      expect(screen.getByText('What do you value most?')).toBeInTheDocument()
      expect(screen.getByLabelText(/skip wizard/i)).toBeInTheDocument()
    })

    it('has proper accessibility attributes', () => {
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'wizard-title')
    })

    it('displays all category options in step 1', () => {
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      expect(screen.getByLabelText(/select one‑card setup/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select dining & groceries/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select flights & hotels/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select everything else/i)).toBeInTheDocument()
    })

    it('shows initial answers as selected', () => {
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      const oneCardButton = screen.getByLabelText(/select one‑card setup/i)
      expect(oneCardButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Step 1: Priority selection', () => {
    it('allows selecting different priorities', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      const diningButton = screen.getByLabelText(/select dining & groceries/i)
      await user.click(diningButton)

      expect(diningButton).toHaveAttribute('aria-pressed', 'true')
      
      // Previous selection should no longer be active
      const oneCardButton = screen.getByLabelText(/select one‑card setup/i)
      expect(oneCardButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('updates button styling when selection changes', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      const diningButton = screen.getByLabelText(/select dining & groceries/i)
      const initialClasses = diningButton.className

      await user.click(diningButton)

      expect(diningButton.className).not.toBe(initialClasses)
      expect(diningButton).toHaveClass('bg-zinc-900', 'text-white')
    })

    it('advances to step 2 when Next is clicked', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      const nextButton = screen.getByRole('button', { name: /go to next step/i })
      await user.click(nextButton)

      expect(screen.getByText('Quick Start • Step 2 of 3')).toBeInTheDocument()
      expect(screen.getByText('How do you feel about annual fees?')).toBeInTheDocument()
    })

    it('disables Back button on first step', () => {
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      const backButton = screen.getByRole('button', { name: /go to previous step/i })
      expect(backButton).toBeDisabled()
    })
  })

  describe('Step 2: Fee comfort selection', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)
      
      const nextButton = screen.getByRole('button', { name: /go to next step/i })
      await user.click(nextButton)
    })

    it('displays fee comfort options', () => {
      expect(screen.getByLabelText(/select any fee comfort level/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select \$0–\$95 fee comfort level/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select \$95–\$199 fee comfort level/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select \$200–\$395 fee comfort level/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select \$400\+ fee comfort level/i)).toBeInTheDocument()
    })

    it('shows initial fee comfort as selected', () => {
      const anyFeeButton = screen.getByLabelText(/select any fee comfort level/i)
      expect(anyFeeButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('allows selecting different fee comfort levels', async () => {
      const user = userEvent.setup()

      const mediumFeeButton = screen.getByLabelText(/select \$95–\$199 fee comfort level/i)
      await user.click(mediumFeeButton)

      expect(mediumFeeButton).toHaveAttribute('aria-pressed', 'true')
      
      // Previous selection should no longer be active
      const anyFeeButton = screen.getByLabelText(/select any fee comfort level/i)
      expect(anyFeeButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('allows going back to step 1', async () => {
      const user = userEvent.setup()

      const backButton = screen.getByRole('button', { name: /go to previous step/i })
      expect(backButton).not.toBeDisabled()
      
      await user.click(backButton)

      expect(screen.getByText('Quick Start • Step 1 of 3')).toBeInTheDocument()
      expect(screen.getByText('What do you value most?')).toBeInTheDocument()
    })

    it('preserves selections when navigating back and forth', async () => {
      const user = userEvent.setup()

      // Select a different fee level
      const highFeeButton = screen.getByLabelText(/select \$200–\$395 fee comfort level/i)
      await user.click(highFeeButton)

      // Go back to step 1
      const backButton = screen.getByRole('button', { name: /go to previous step/i })
      await user.click(backButton)

      // Go forward to step 2 again
      const nextButton = screen.getByRole('button', { name: /go to next step/i })
      await user.click(nextButton)

      // Selection should be preserved
      expect(highFeeButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Step 3: Redemption preference', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)
      
      // Navigate to step 3
      let nextButton = screen.getByRole('button', { name: /go to next step/i })
      await user.click(nextButton)
      
      nextButton = screen.getByRole('button', { name: /go to next step/i })
      await user.click(nextButton)
    })

    it('displays redemption preference options', () => {
      expect(screen.getByText('Quick Start • Step 3 of 3')).toBeInTheDocument()
      expect(screen.getByText('How do you prefer rewards?')).toBeInTheDocument()
      
      expect(screen.getByLabelText(/select transferable points redemption preference/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select cash back redemption preference/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/select whatever's simplest redemption preference/i)).toBeInTheDocument()
    })

    it('shows initial redemption preference as selected', () => {
      const simpleButton = screen.getByLabelText(/select whatever's simplest redemption preference/i)
      expect(simpleButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('shows "See my picks" button instead of Next', () => {
      expect(screen.queryByRole('button', { name: /go to next step/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /complete wizard and see recommendations/i })).toBeInTheDocument()
    })

    it('calls onDone with final answers when "See my picks" is clicked', async () => {
      const user = userEvent.setup()

      // Select different options
      const pointsButton = screen.getByLabelText(/select transferable points redemption preference/i)
      await user.click(pointsButton)

      const completeButton = screen.getByRole('button', { name: /complete wizard and see recommendations/i })
      await user.click(completeButton)

      expect(mockOnDone).toHaveBeenCalledWith({
        priority: 'one_card',
        feeComfort: 'any',
        redemption: 'points'
      })
    })
  })

  describe('Skip functionality', () => {
    it('calls onDone with current answers when Skip is clicked', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      const skipButton = screen.getByLabelText(/skip wizard/i)
      await user.click(skipButton)

      expect(mockOnDone).toHaveBeenCalledWith(initialAnswers)
    })

    it('calls onDone with modified answers if changes were made before skipping', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      // Make a change
      const diningButton = screen.getByLabelText(/select dining & groceries/i)
      await user.click(diningButton)

      // Skip
      const skipButton = screen.getByLabelText(/skip wizard/i)
      await user.click(skipButton)

      expect(mockOnDone).toHaveBeenCalledWith({
        ...initialAnswers,
        priority: 'dining_groceries'
      })
    })
  })

  describe('Keyboard navigation', () => {
    it('closes wizard when Escape is pressed', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      await user.keyboard('{Escape}')

      expect(mockOnDone).toHaveBeenCalledWith(initialAnswers)
    })

    it('advances to next step when Enter is pressed (not on final step)', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      await user.keyboard('{Enter}')

      expect(screen.getByText('Quick Start • Step 2 of 3')).toBeInTheDocument()
    })

    it('does not advance when Enter is pressed on final step', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      // Navigate to final step
      await user.keyboard('{Enter}') // Step 2
      await user.keyboard('{Enter}') // Step 3

      // Press Enter again - should not do anything
      await user.keyboard('{Enter}')

      expect(screen.getByText('Quick Start • Step 3 of 3')).toBeInTheDocument()
      expect(mockOnDone).not.toHaveBeenCalled()
    })

    it('supports tab navigation between options', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      // Tab through category options
      await user.tab()
      
      const firstOption = screen.getByLabelText(/select one‑card setup/i)
      expect(firstOption).toHaveFocus()
    })
  })

  describe('Focus management', () => {
    it('sets focus on step change', async () => {
      const user = userEvent.setup()
      const mockFocus = jest.fn()
      HTMLElement.prototype.focus = mockFocus

      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      const nextButton = screen.getByRole('button', { name: /go to next step/i })
      await user.click(nextButton)

      // Should call focus when step changes
      expect(mockFocus).toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('handles rapid step changes gracefully', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      const nextButton = screen.getByRole('button', { name: /go to next step/i })
      
      // Rapid clicks
      await user.click(nextButton)
      await user.click(nextButton)

      expect(screen.getByText('Quick Start • Step 3 of 3')).toBeInTheDocument()
    })

    it('handles step boundaries correctly', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      // Can't go below step 1
      const backButton = screen.getByRole('button', { name: /go to previous step/i })
      expect(backButton).toBeDisabled()

      // Navigate to final step
      const nextButton = screen.getByRole('button', { name: /go to next step/i })
      await user.click(nextButton)
      await user.click(nextButton)

      // Can't go beyond step 3
      expect(screen.queryByRole('button', { name: /go to next step/i })).not.toBeInTheDocument()
    })

    it('preserves all answer changes throughout navigation', async () => {
      const user = userEvent.setup()
      render(<Wizard initial={initialAnswers} onDone={mockOnDone} />)

      // Step 1: Change priority
      const diningButton = screen.getByLabelText(/select dining & groceries/i)
      await user.click(diningButton)

      // Go to Step 2
      let nextButton = screen.getByRole('button', { name: /go to next step/i })
      await user.click(nextButton)

      // Step 2: Change fee comfort
      const mediumFeeButton = screen.getByLabelText(/select \$95–\$199 fee comfort level/i)
      await user.click(mediumFeeButton)

      // Go to Step 3
      nextButton = screen.getByRole('button', { name: /go to next step/i })
      await user.click(nextButton)

      // Step 3: Change redemption
      const pointsButton = screen.getByLabelText(/select transferable points redemption preference/i)
      await user.click(pointsButton)

      // Complete wizard
      const completeButton = screen.getByRole('button', { name: /complete wizard and see recommendations/i })
      await user.click(completeButton)

      expect(mockOnDone).toHaveBeenCalledWith({
        priority: 'dining_groceries',
        feeComfort: '$$',
        redemption: 'points'
      })
    })
  })
})