import { useEffect, useRef } from 'react'
import type { Question } from '../types'
import { isMultiAnswer } from '../types'
import { useShuffledOptions } from '../hooks/useShuffledOptions'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedIndex: number | null
  onSelect: (index: number) => void
  onNext: () => void
  pendingIndices?: number[]
  onToggle?: (index: number) => void
  onSubmitMulti?: () => void
  answered?: boolean
  pendingSingleIndex?: number | null
  onSubmitSingle?: () => void
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  onSelect,
  onNext,
  pendingIndices = [],
  onToggle = () => undefined,
  answered: answeredProp,
  pendingSingleIndex = null,
  onSubmitSingle = () => undefined,
}: QuestionCardProps) {
  const multiMode = isMultiAnswer(question)
  const answered = multiMode ? (answeredProp ?? false) : selectedIndex !== null

  const { shuffledOptions, shuffledAnswerIndex, shuffledAnswerIndices, originalIndexOf } =
    useShuffledOptions(question)

  // selectedIndex and pendingIndices live in original-index space.
  // We need the shuffled position of the currently-selected original index.
  const selectedShuffledIndex =
    selectedIndex !== null
      ? shuffledOptions.findIndex((_, si) => originalIndexOf(si) === selectedIndex)
      : null

  const pendingSingleShuffledIndex =
    !multiMode && pendingSingleIndex !== null
      ? shuffledOptions.findIndex((_, si) => originalIndexOf(si) === pendingSingleIndex)
      : null

  const getOptionClass = (shuffledIdx: number) => {
    if (!answered) {
      return shuffledIdx === pendingSingleShuffledIndex ? 'option option--checked' : 'option'
    }
    if (shuffledIdx === shuffledAnswerIndex) return 'option correct'
    if (shuffledIdx === selectedShuffledIndex) return 'option incorrect'
    return 'option'
  }

  const getMultiOptionClass = (shuffledIdx: number) => {
    const origIdx = originalIndexOf(shuffledIdx)
    const isCorrectAnswer = shuffledAnswerIndices.includes(shuffledIdx)
    const isSelected = pendingIndices.includes(origIdx)
    if (!answered) {
      return isSelected ? 'option option--checked' : 'option'
    }
    if (isCorrectAnswer && isSelected) return 'option correct'
    if (isCorrectAnswer && !isSelected) return 'option correct option--missed'
    if (isSelected && !isCorrectAnswer) return 'option incorrect'
    return 'option'
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (multiMode) return
      if (!answered) {
        const map: Record<string, number> = {
          '1': 0,
          a: 0,
          A: 0,
          '2': 1,
          b: 1,
          B: 1,
          '3': 2,
          c: 2,
          C: 2,
          '4': 3,
          d: 3,
          D: 3,
        }
        if (e.key in map) onSelect(originalIndexOf(map[e.key]))
        if ((e.key === 'Enter' || e.key === ' ') && !multiMode) {
          if (pendingSingleIndex !== null) onSubmitSingle()
          return
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') onNext()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [answered, multiMode, onSelect, onNext, originalIndexOf, pendingSingleIndex, onSubmitSingle])

  const optionButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  const explanationBlock =
    answered && question.explanation ? (
      <p className="explanation" data-testid="explanation">
        {question.explanation}
      </p>
    ) : null

  return (
    <div className="question-card">
      <div className="progress-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="progress-bar-container"
            aria-label={`Question ${questionNumber} of ${totalQuestions}`}
          >
            <div
              className="progress-bar-fill"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
          <p className="progress">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>
      </div>
      <p className="category">{question.category}</p>
      <h2>{question.text}</h2>
      {multiMode ? (
        <>
          <p className="multi-hint">Select all that apply</p>
          <div className="question-body">
            <div className="options">
              {shuffledOptions.map((opt, si) => {
                const origIdx = originalIndexOf(si)
                const isMissed =
                  answered &&
                  shuffledAnswerIndices.includes(si) &&
                  !pendingIndices.includes(origIdx)
                return (
                  <button
                    key={si}
                    className={getMultiOptionClass(si)}
                    onClick={() => onToggle(origIdx)}
                    disabled={answered}
                    data-label={LABELS[si]}
                    style={{ '--option-index': si } as React.CSSProperties}
                  >
                    <span className="option-label">
                      {LABELS[si]}
                      <span className="option-key-hint">[{si + 1}]</span>
                    </span>
                    {opt}
                    {isMissed && (
                      <span className="option-missed-label" aria-label="You missed this answer">
                        ⚠ You missed this
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {explanationBlock}
          </div>
        </>
      ) : (
        <div className="question-body">
          <div className="options">
            {shuffledOptions.map((opt, si) => (
              <button
                key={si}
                className={getOptionClass(si)}
                ref={(el) => {
                  if (el) optionButtonRefs.current.set(si, el)
                  else optionButtonRefs.current.delete(si)
                }}
                onClick={() => {
                  if (si === pendingSingleShuffledIndex) {
                    optionButtonRefs.current.get(si)?.blur()
                  }
                  onSelect(originalIndexOf(si))
                }}
                disabled={answered}
                data-label={LABELS[si]}
                style={{ '--option-index': si } as React.CSSProperties}
              >
                <span className="option-label">
                  {LABELS[si]}
                  <span className="option-key-hint">[{si + 1}]</span>
                </span>
                {opt}
              </button>
            ))}
          </div>
          {explanationBlock}
        </div>
      )}
    </div>
  )
}
