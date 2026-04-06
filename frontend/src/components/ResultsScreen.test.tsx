import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { ResultsScreen } from './ResultsScreen'
import type { Question, AnswerRecord } from '../types'

function makeQuestions(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i + 1}`,
    text: `Question ${i + 1}?`,
    options: ['A', 'B', 'C', 'D'],
    answerIndex: 0,
    category: 'Test',
  }))
}

function makeAnswers(total: number, correctCount: number): AnswerRecord[] {
  return Array.from({ length: total }, (_, i) => ({
    questionId: `q${i + 1}`,
    selectedIndex: 0,
    correct: i < correctCount,
  }))
}

function makeMultiQuestion(): Question {
  return {
    id: 'mq1',
    text: 'Multi question?',
    options: ['A', 'B', 'C', 'D'],
    answerIndex: 0,
    answerIndices: [0, 1],
    category: 'Test',
  }
}

describe('ResultsScreen pass/fail at 75%', () => {
  it('passes at 18/24 (75%)', () => {
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 18)}
        onStartNew={vi.fn()}
        onHome={vi.fn()}
      />
    )
    expect(screen.getByText('Pass 🎉')).toBeInTheDocument()
  })

  it('fails at 17/24 (below 75%)', () => {
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 17)}
        onStartNew={vi.fn()}
        onHome={vi.fn()}
      />
    )
    expect(screen.getByText('Keep practising 📖')).toBeInTheDocument()
  })

  it('passes at 24/24 (100%)', () => {
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 24)}
        onStartNew={vi.fn()}
        onHome={vi.fn()}
      />
    )
    expect(screen.getByText('Pass 🎉')).toBeInTheDocument()
  })

  it('fails at 0/24', () => {
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 0)}
        onStartNew={vi.fn()}
        onHome={vi.fn()}
      />
    )
    expect(screen.getByText('Keep practising 📖')).toBeInTheDocument()
  })
})

describe('ResultsScreen buttons', () => {
  it('renders "Start New" button', () => {
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 18)}
        onStartNew={vi.fn()}
        onHome={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Start New' })).toBeInTheDocument()
  })

  it('calls onStartNew when "Start New" is clicked', async () => {
    const onStartNew = vi.fn()
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 18)}
        onStartNew={onStartNew}
        onHome={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Start New' }))
    expect(onStartNew).toHaveBeenCalledTimes(1)
  })
})

describe('ResultsScreen score ring colour', () => {
  it('sets --ring-color to var(--color-correct) when passing', () => {
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 18)}
        onStartNew={vi.fn()}
        onHome={vi.fn()}
      />
    )
    const ring = document.querySelector('.score-ring') as HTMLElement
    expect(ring.style.getPropertyValue('--ring-color')).toBe('var(--color-correct)')
  })

  it('sets --ring-color to var(--color-warning) when failing', () => {
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 0)}
        onStartNew={vi.fn()}
        onHome={vi.fn()}
      />
    )
    const ring = document.querySelector('.score-ring') as HTMLElement
    expect(ring.style.getPropertyValue('--ring-color')).toBe('var(--color-warning)')
  })
})

describe('ResultsScreen verdict classes', () => {
  it('verdict element has class "pass" when passing', () => {
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 18)}
        onStartNew={vi.fn()}
        onHome={vi.fn()}
      />
    )
    const verdict = screen.getByText('Pass 🎉')
    expect(verdict).toHaveClass('verdict')
    expect(verdict).toHaveClass('pass')
  })

  it('verdict element has class "fail" when failing', () => {
    render(
      <ResultsScreen
        questions={makeQuestions(24)}
        answers={makeAnswers(24, 0)}
        onStartNew={vi.fn()}
        onHome={vi.fn()}
      />
    )
    const verdict = screen.getByText('Keep practising 📖')
    expect(verdict).toHaveClass('verdict')
    expect(verdict).toHaveClass('fail')
  })
})

describe('ResultsScreen answer detail — always shown', () => {
  it('hides "Correct answer" row when the user answered correctly (single-answer)', () => {
    const q = makeQuestions(1) // options: ['A','B','C','D'], answerIndex: 0
    const answers: AnswerRecord[] = [{ questionId: 'q1', selectedIndex: 0, correct: true }]
    render(<ResultsScreen questions={q} answers={answers} onStartNew={vi.fn()} onHome={vi.fn()} />)
    expect(screen.queryByText(/Correct answer:/)).not.toBeInTheDocument()
  })

  it('shows user answer for a correct single-answer question', () => {
    const q = makeQuestions(1)
    const answers: AnswerRecord[] = [{ questionId: 'q1', selectedIndex: 0, correct: true }]
    render(<ResultsScreen questions={q} answers={answers} onStartNew={vi.fn()} onHome={vi.fn()} />)
    expect(screen.getByText(/Your answer: A/)).toBeInTheDocument()
  })

  it('shows user wrong answer and correct answer for an incorrect single-answer question', () => {
    const q = makeQuestions(1) // options: ['A','B','C','D'], answerIndex: 0
    const answers: AnswerRecord[] = [{ questionId: 'q1', selectedIndex: 1, correct: false }]
    render(<ResultsScreen questions={q} answers={answers} onStartNew={vi.fn()} onHome={vi.fn()} />)
    expect(screen.getByText(/Your answer: B/)).toBeInTheDocument()
    expect(screen.getByText(/Correct answer: A/)).toBeInTheDocument()
  })

  it('hides "Correct answer" row when the user answered a multi-answer question correctly', () => {
    const q = makeMultiQuestion() // answerIndices: [0, 1], options: ['A','B','C','D']
    const answers: AnswerRecord[] = [{ questionId: 'mq1', selectedIndices: [0, 1], correct: true }]
    render(
      <ResultsScreen questions={[q]} answers={answers} onStartNew={vi.fn()} onHome={vi.fn()} />
    )
    expect(screen.queryByText(/Correct answer:/)).not.toBeInTheDocument()
  })

  it('shows user multi-answer selection when non-empty', () => {
    const q = makeMultiQuestion()
    const answers: AnswerRecord[] = [{ questionId: 'mq1', selectedIndices: [2, 3], correct: false }]
    render(
      <ResultsScreen questions={[q]} answers={answers} onStartNew={vi.fn()} onHome={vi.fn()} />
    )
    expect(screen.getByText(/Your answer: C, D/)).toBeInTheDocument()
    expect(screen.getByText(/Correct answer: A, B/)).toBeInTheDocument()
  })

  it('does not show "Your answer" when multi-answer selectedIndices is empty', () => {
    const q = makeMultiQuestion()
    const answers: AnswerRecord[] = [{ questionId: 'mq1', selectedIndices: [], correct: false }]
    render(
      <ResultsScreen questions={[q]} answers={answers} onStartNew={vi.fn()} onHome={vi.fn()} />
    )
    expect(screen.queryByText(/Your answer:/)).not.toBeInTheDocument()
  })

  it('shows "Correct answer" when correct is true but no selection was recorded (multi-answer)', () => {
    const q = makeMultiQuestion()
    const answers: AnswerRecord[] = [{ questionId: 'mq1', selectedIndices: [], correct: true }]
    render(
      <ResultsScreen questions={[q]} answers={answers} onStartNew={vi.fn()} onHome={vi.fn()} />
    )
    // userAnswerText is null (empty selectedIndices) so "Correct answer" must still show
    expect(screen.getByText(/Correct answer: A, B/)).toBeInTheDocument()
  })
})

describe('ResultsScreen edge cases', () => {
  it('renders without crash when questions and answers are empty', () => {
    render(<ResultsScreen questions={[]} answers={[]} onStartNew={vi.fn()} onHome={vi.fn()} />)
    expect(screen.getByText('Keep practising 📖')).toBeInTheDocument()
    expect(screen.getByText('0/0')).toBeInTheDocument()
  })

  it('renders question without "Your answer" when answer is missing from array', () => {
    const q = makeQuestions(2)
    // Only one answer provided for two questions
    const answers: AnswerRecord[] = [{ questionId: 'q1', selectedIndex: 0, correct: true }]
    render(<ResultsScreen questions={q} answers={answers} onStartNew={vi.fn()} onHome={vi.fn()} />)
    // q2 has no answer — "Correct answer: A" shown for q2; hidden for q1 (correct with answer)
    const correctLabels = screen.getAllByText(/Correct answer: A/)
    expect(correctLabels.length).toBe(1)
  })
})
