import type { Question, AnswerRecord } from '../types'
import { isMultiAnswer, isMultiAnswerRecord } from '../types'

interface ResultsScreenProps {
  questions: Question[]
  answers: AnswerRecord[]
  onStartNew: () => void
  onHome: () => void
}

function getCorrectAnswerText(q: Question): string {
  if (isMultiAnswer(q)) {
    return q.answerIndices.map((idx) => q.options[idx]).join(', ')
  }
  return q.options[q.answerIndex]
}

function getUserAnswerText(q: Question, answer: AnswerRecord | undefined): string | null {
  if (!answer) return null
  if (isMultiAnswer(q) && isMultiAnswerRecord(answer)) {
    if (answer.selectedIndices.length === 0) return null
    return answer.selectedIndices.map((idx) => q.options[idx]).join(', ')
  }
  if (!isMultiAnswerRecord(answer)) {
    return q.options[answer.selectedIndex]
  }
  return null
}

export function ResultsScreen({ questions, answers, onStartNew }: ResultsScreenProps) {
  const correctCount = answers.filter((a) => a.correct).length
  const total = questions.length
  const pct = total > 0 ? correctCount / total : 0
  const passed = pct >= 0.75

  return (
    <div className="results-screen">
      <h1>Your Results</h1>
      <div className="score-ring-wrapper">
        <div
          className="score-ring"
          style={
            {
              '--pct': `${Math.round(pct * 100)}`,
              '--ring-color': passed ? 'var(--color-correct)' : 'var(--color-warning)',
            } as React.CSSProperties
          }
        >
          <div>
            <p className="score">
              {correctCount}/{total}
            </p>
            <span className="score-pct">{Math.round(pct * 100)}%</span>
          </div>
        </div>
      </div>
      <p className={`verdict ${passed ? 'pass' : 'fail'}`}>
        {passed ? 'Pass 🎉' : 'Keep practising 📖'}
      </p>
      <div className="breakdown-scroll">
        <ol className="breakdown">
          {questions.map((q, i) => {
            const answer = answers[i]
            const correct = answer?.correct ?? false
            const correctAnswerText = getCorrectAnswerText(q)
            const userAnswerText = getUserAnswerText(q, answer)
            return (
              <li key={q.id} className={`breakdown-item ${correct ? 'correct' : 'incorrect'}`}>
                <span className="icon">{correct ? '✓' : '✗'}</span>
                <div>
                  <p className="question-text">{q.text}</p>
                  <div className="answer-detail">
                    {userAnswerText !== null && (
                      <span className={`answer-yours ${correct ? 'correct' : 'incorrect'}`}>
                        Your answer: {userAnswerText}
                      </span>
                    )}
                    {(!correct || userAnswerText === null) && (
                      <span className="answer-correct-label">
                        Correct answer: {correctAnswerText}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="results-actions">
        <button className="primary-btn" onClick={onStartNew}>
          Start New
        </button>
      </div>
    </div>
  )
}
