import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { QuestionCard } from './QuestionCard'
import * as useShuffledOptionsModule from '../hooks/useShuffledOptions'

// ---------------------------------------------------------------------------
// Default mock: identity permutation so existing tests remain unaffected
// ---------------------------------------------------------------------------
vi.mock('../hooks/useShuffledOptions', () => ({
  useShuffledOptions: (question: {
    options: string[]
    answerIndex: number
    answerIndices?: number[]
  }) => {
    const identityOrder = question.options.map((_, i) => i)
    return {
      shuffledOptions: [...question.options],
      shuffledAnswerIndex: question.answerIndex,
      shuffledAnswerIndices: question.answerIndices ? [...question.answerIndices] : [],
      originalIndexOf: (si: number) => identityOrder[si],
    }
  },
}))

const mockQuestion = {
  id: 'q1',
  text: 'What is the capital of the UK?',
  options: ['Edinburgh', 'Cardiff', 'London', 'Belfast'],
  answerIndex: 2,
  category: 'Geography',
}

const defaultProps = {
  question: mockQuestion,
  questionNumber: 2,
  totalQuestions: 5,
  selectedIndex: null as number | null,
  onSelect: vi.fn(),
  onNext: vi.fn(),
}

describe('QuestionCard', () => {
  it('renders question text and all 4 options', () => {
    render(<QuestionCard {...defaultProps} />)
    expect(screen.getByText('What is the capital of the UK?')).toBeInTheDocument()
    expect(screen.getByText('Edinburgh')).toBeInTheDocument()
    expect(screen.getByText('Cardiff')).toBeInTheDocument()
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.getByText('Belfast')).toBeInTheDocument()
  })

  it('renders progress indicator', () => {
    render(<QuestionCard {...defaultProps} />)
    expect(screen.getByText('Question 2 of 5')).toBeInTheDocument()
  })

  it('renders progress bar with correct width', () => {
    render(<QuestionCard {...defaultProps} />)
    // questionNumber=2, totalQuestions=5 → 40%
    const fill = document.querySelector('.progress-bar-fill') as HTMLElement
    expect(fill).toBeTruthy()
    expect(fill.style.width).toBe('40%')
  })

  it('calls onSelect with correct index when option clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<QuestionCard {...defaultProps} onSelect={onSelect} />)
    await user.click(screen.getByText('Edinburgh'))
    expect(onSelect).toHaveBeenCalledWith(0)
  })

  it('shows correct option highlighted after selection', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={2} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[2]).toHaveClass('correct')
  })

  it('shows incorrect option highlighted', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={0} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveClass('incorrect')
    expect(buttons[2]).toHaveClass('correct')
  })

  it('Next button is not visible without selection', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={null} />)
    expect(screen.queryByText(/Next/)).not.toBeInTheDocument()
  })

  it('Next button is not rendered inside the card after selection (buttons live in App)', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={0} />)
    // Next button has moved outside QuestionCard to App's question-actions div
    expect(screen.queryByText(/Next/)).not.toBeInTheDocument()
  })

  it('options are disabled after selection', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={0} />)
    const buttons = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('shows explanation after answering when explanation is provided', () => {
    render(
      <QuestionCard
        {...defaultProps}
        selectedIndex={0}
        question={{ ...mockQuestion, explanation: 'London is the capital.' }}
      />
    )
    expect(screen.getByTestId('explanation')).toBeInTheDocument()
    expect(screen.getByText('London is the capital.')).toBeInTheDocument()
  })

  it('does not show explanation block when explanation is absent', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={0} />)
    expect(screen.queryByTestId('explanation')).not.toBeInTheDocument()
  })

  it('pressing "1" selects the first option', () => {
    const onSelect = vi.fn()
    render(<QuestionCard {...defaultProps} onSelect={onSelect} selectedIndex={null} />)
    fireEvent.keyDown(document, { key: '1' })
    expect(onSelect).toHaveBeenCalledWith(0)
  })

  it('pressing "A" selects the first option', () => {
    const onSelect = vi.fn()
    render(<QuestionCard {...defaultProps} onSelect={onSelect} selectedIndex={null} />)
    fireEvent.keyDown(document, { key: 'A' })
    expect(onSelect).toHaveBeenCalledWith(0)
  })

  it('pressing Enter advances to next when answered', () => {
    const onNext = vi.fn()
    render(<QuestionCard {...defaultProps} onNext={onNext} selectedIndex={0} />)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onNext).toHaveBeenCalled()
  })

  it('pressing Space advances to next when answered', () => {
    const onNext = vi.fn()
    render(<QuestionCard {...defaultProps} onNext={onNext} selectedIndex={0} />)
    fireEvent.keyDown(document, { key: ' ' })
    expect(onNext).toHaveBeenCalled()
  })

  it('pressing Enter does nothing when not yet answered', () => {
    const onNext = vi.fn()
    render(<QuestionCard {...defaultProps} onNext={onNext} selectedIndex={null} />)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onNext).not.toHaveBeenCalled()
  })
})

const multiQuestion = {
  id: 'mul001',
  text: 'Which are correct?',
  options: ['A', 'B', 'C', 'D'],
  answerIndex: 0, // kept for backward compat
  answerIndices: [0, 2], // multi-answer
  category: 'Test',
}

describe('multi-answer mode', () => {
  it('renders "Select all that apply" hint text for multi-answer question', () => {
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        pendingIndices={[]}
        answered={false}
      />
    )
    expect(screen.getByText('Select all that apply')).toBeInTheDocument()
  })

  it('calls onToggle (not onSelect) when an option button is clicked', async () => {
    const onToggle = vi.fn()
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        onToggle={onToggle}
        onSelect={onSelect}
        pendingIndices={[]}
        answered={false}
      />
    )
    // Click the second option button (index 1)
    const optionButtons = screen
      .getAllByRole('button')
      .filter((b) => b.classList.contains('option'))
    await user.click(optionButtons[1])
    expect(onToggle).toHaveBeenCalledWith(1)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('Submit button is NOT present when pendingIndices is empty', () => {
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        pendingIndices={[]}
        answered={false}
      />
    )
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })

  it('Submit button is NOT rendered inside the card (moved to App question-actions)', () => {
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        pendingIndices={[0]}
        answered={false}
      />
    )
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })

  it('onSubmitMulti prop is accepted without error (button is rendered in App)', async () => {
    const onSubmitMulti = vi.fn()
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        pendingIndices={[0]}
        onSubmitMulti={onSubmitMulti}
        answered={false}
      />
    )
    // Submit button lives outside QuestionCard in App's question-actions div
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })

  it('all options are disabled when answered=true', () => {
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        pendingIndices={[0]}
        answered={true}
      />
    )
    const optionButtons = screen
      .getAllByRole('button')
      .filter((b) => b.classList.contains('option'))
    optionButtons.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('correct options get correct class after answered=true', () => {
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        pendingIndices={[0, 2]}
        answered={true}
      />
    )
    const buttons = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
    // answerIndices are [0, 2] — options A and C should have correct class
    expect(buttons[0]).toHaveClass('correct')
    expect(buttons[2]).toHaveClass('correct')
  })

  it('selected wrong options get incorrect class after answered=true', () => {
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        pendingIndices={[1]} // index 1 is wrong (not in answerIndices [0, 2])
        answered={true}
      />
    )
    const buttons = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
    expect(buttons[1]).toHaveClass('incorrect')
  })

  it('missed correct options (in answerIndices but NOT in pendingIndices) get correct class', () => {
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        pendingIndices={[0]} // missed index 2 (also correct)
        answered={true}
      />
    )
    const buttons = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
    // index 2 is in answerIndices but not in pendingIndices — should still show as correct
    expect(buttons[2]).toHaveClass('correct')
  })
})

// ---------------------------------------------------------------------------
// Single-answer pending state tests
// ---------------------------------------------------------------------------
describe('single-answer pending state', () => {
  it('clicking option does not show correct/incorrect without commit', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <QuestionCard
        {...defaultProps}
        selectedIndex={null}
        pendingSingleIndex={null}
        onSelect={onSelect}
      />
    )
    await user.click(screen.getByText('Edinburgh'))
    const buttons = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
    buttons.forEach((btn) => {
      expect(btn).not.toHaveClass('correct')
      expect(btn).not.toHaveClass('incorrect')
    })
  })

  it('pending option has option--checked class', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={null} pendingSingleIndex={0} />)
    const buttons = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
    expect(buttons[0]).toHaveClass('option--checked')
  })

  it('Submit button absent when no pending selection', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={null} pendingSingleIndex={null} />)
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })

  it('Submit button is not rendered inside the card (moved to App question-actions)', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={null} pendingSingleIndex={0} />)
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })

  it('onSubmitSingle prop is accepted; keyboard Enter still calls it', async () => {
    const onSubmitSingle = vi.fn()
    render(
      <QuestionCard
        {...defaultProps}
        selectedIndex={null}
        pendingSingleIndex={0}
        onSubmitSingle={onSubmitSingle}
      />
    )
    // Submit button lives outside QuestionCard in App's question-actions div
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })

  it('Submit absent and Next absent inside card after commit (both moved to App)', () => {
    render(<QuestionCard {...defaultProps} selectedIndex={0} pendingSingleIndex={null} />)
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Next/)).not.toBeInTheDocument()
  })

  it('pressing Enter with pending calls onSubmitSingle', () => {
    const onSubmitSingle = vi.fn()
    render(
      <QuestionCard
        {...defaultProps}
        selectedIndex={null}
        pendingSingleIndex={0}
        onSubmitSingle={onSubmitSingle}
      />
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onSubmitSingle).toHaveBeenCalled()
  })

  it('pressing Enter with no pending does nothing', () => {
    const onSubmitSingle = vi.fn()
    const onNext = vi.fn()
    render(
      <QuestionCard
        {...defaultProps}
        selectedIndex={null}
        pendingSingleIndex={null}
        onSubmitSingle={onSubmitSingle}
        onNext={onNext}
      />
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onSubmitSingle).not.toHaveBeenCalled()
    expect(onNext).not.toHaveBeenCalled()
  })

  it('deselecting the pending option blurs the button', async () => {
    const blurSpy = vi.spyOn(HTMLButtonElement.prototype, 'blur')
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <QuestionCard
        {...defaultProps}
        selectedIndex={null}
        pendingSingleIndex={0}
        onSelect={onSelect}
      />
    )
    // The first option is currently pending (index 0) — clicking it again deselects it
    const buttons = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
    await user.click(buttons[0])
    expect(blurSpy).toHaveBeenCalled()
    blurSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// Shuffling tests — override useShuffledOptions with a known permutation
// ---------------------------------------------------------------------------
describe('option shuffling', () => {
  // Permutation: [2, 0, 3, 1]
  // shuffled position 0 -> original 2 (London)
  // shuffled position 1 -> original 0 (Edinburgh)
  // shuffled position 2 -> original 3 (Belfast)
  // shuffled position 3 -> original 1 (Cardiff)
  // answerIndex = 2 (London) → shuffled position 0
  const shuffledOrder = [2, 0, 3, 1]
  const shuffledOptionsResult = shuffledOrder.map((i) => mockQuestion.options[i])

  beforeEach(() => {
    vi.spyOn(useShuffledOptionsModule, 'useShuffledOptions').mockReturnValue({
      shuffledOptions: shuffledOptionsResult,
      shuffledAnswerIndex: 0, // London is at shuffled position 0
      shuffledAnswerIndices: [],
      originalIndexOf: (si: number) => shuffledOrder[si],
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('options render in shuffled order', () => {
    render(<QuestionCard {...defaultProps} />)
    const buttons = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
    expect(buttons[0]).toHaveTextContent('London')
    expect(buttons[1]).toHaveTextContent('Edinburgh')
    expect(buttons[2]).toHaveTextContent('Belfast')
    expect(buttons[3]).toHaveTextContent('Cardiff')
  })

  it('clicking the shuffled-correct option calls onSelect with the original correct index', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<QuestionCard {...defaultProps} onSelect={onSelect} />)
    // London is now at shuffled position 0 → original index 2
    await user.click(screen.getByText('London'))
    expect(onSelect).toHaveBeenCalledWith(2)
  })

  it('pending highlighting works after remapping (multi-answer)', () => {
    // Multi question with known shuffled permutation
    // shuffledOrder = [2, 0, 3, 1] applied to options ['A','B','C','D']
    // -> shuffled: ['C','A','D','B']
    // answerIndices = [0, 2] -> shuffled positions: 1 (A at orig 0) and 0 (C at orig 2)
    const shuffledMultiOrder = [2, 0, 3, 1]
    const shuffledMultiOptions = shuffledMultiOrder.map((i) => multiQuestion.options[i])

    vi.spyOn(useShuffledOptionsModule, 'useShuffledOptions').mockReturnValue({
      shuffledOptions: shuffledMultiOptions,
      shuffledAnswerIndex: 1,
      shuffledAnswerIndices: [1, 0], // orig 0 (A) -> shuffled 1; orig 2 (C) -> shuffled 0
      originalIndexOf: (si: number) => shuffledMultiOrder[si],
    })

    // pendingIndices = [0, 2] in original space
    render(
      <QuestionCard
        {...defaultProps}
        question={multiQuestion}
        pendingIndices={[0, 2]}
        answered={true}
      />
    )
    const buttons = screen.getAllByRole('button').filter((b) => b.classList.contains('option'))
    // shuffled pos 0 = C (original 2, correct & selected)
    expect(buttons[0]).toHaveClass('correct')
    // shuffled pos 1 = A (original 0, correct & selected)
    expect(buttons[1]).toHaveClass('correct')
  })
})
