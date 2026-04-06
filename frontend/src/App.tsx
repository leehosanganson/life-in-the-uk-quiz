import { useState } from 'react'
import { useQuiz } from './hooks/useQuiz'
import { useQuestionsCount } from './hooks/useQuestionsCount'
import { StartScreen } from './components/StartScreen'
import { QuestionCard } from './components/QuestionCard'
import { ResultsScreen } from './components/ResultsScreen'
import { ThemeToggle } from './components/ThemeToggle'
import { GitHubLink } from './components/GitHubLink'
import { HomeButton } from './components/HomeButton'
import { StatsPage } from './components/StatsPage'
import { PrivacyPolicy } from './components/PrivacyPolicy'
import { TermsOfService } from './components/TermsOfService'
import { CookiePolicy } from './components/CookiePolicy'
import { Disclaimer } from './components/Disclaimer'
import { isMultiAnswer, isMultiAnswerRecord } from './types'
import './index.css'

function App() {
  const [view, setView] = useState<
    'quiz' | 'stats' | 'privacy' | 'terms' | 'cookies' | 'disclaimer'
  >('quiz')
  const {
    status,
    questions,
    currentIndex,
    answers,
    isLoading,
    error,
    startQuiz,
    startPracticeHardQuiz,
    setPendingSingle,
    submitSingleAnswer,
    pendingSingleIndex,
    nextQuestion,
    resetQuiz,
    pendingIndices,
    togglePendingIndex,
    submitMultiAnswer,
  } = useQuiz()

  const { count: questionsCount } = useQuestionsCount()

  const handleHomeClick = () => {
    if (view !== 'quiz') {
      setView('quiz')
    } else if (status !== 'idle') {
      resetQuiz()
    }
    // else: no-op
  }

  const isHomeNoOp = view === 'quiz' && status === 'idle'

  // Derive selectedIndex for single-answer mode (type-narrowed)
  const currentAnswer = answers[currentIndex]
  const selectedIndex =
    currentAnswer && !isMultiAnswerRecord(currentAnswer) ? currentAnswer.selectedIndex : null

  // For multi-answer mode: once answered, use the committed selectedIndices from the
  // answer record so QuestionCard can highlight wrong picks red. While the question is
  // still being answered, use the live pendingIndices.
  const displayedPendingIndices =
    currentAnswer && isMultiAnswerRecord(currentAnswer)
      ? currentAnswer.selectedIndices
      : pendingIndices

  const answered = answers.length > currentIndex
  const isLast = questions.length > 0 && currentIndex + 1 === questions.length
  const isMultiMode = questions.length > 0 && isMultiAnswer(questions[currentIndex])
  const canSubmit =
    (!isMultiMode && pendingSingleIndex !== null) || (isMultiMode && pendingIndices.length > 0)

  return (
    <>
      <HomeButton onClick={handleHomeClick} isHidden={isHomeNoOp} />
      <div className="nav-right">
        <GitHubLink />
        <ThemeToggle />
      </div>
      {view === 'stats' && <StatsPage onBack={() => setView('quiz')} />}
      {view === 'privacy' && <PrivacyPolicy onBack={() => setView('quiz')} />}
      {view === 'terms' && <TermsOfService onBack={() => setView('quiz')} />}
      {view === 'cookies' && <CookiePolicy onBack={() => setView('quiz')} />}
      {view === 'disclaimer' && <Disclaimer onBack={() => setView('quiz')} />}
      {view === 'quiz' && status === 'active' && (
        <QuestionCard
          question={questions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedIndex={selectedIndex}
          onSelect={setPendingSingle}
          onNext={nextQuestion}
          pendingIndices={displayedPendingIndices}
          onToggle={togglePendingIndex}
          onSubmitMulti={submitMultiAnswer}
          onSubmitSingle={submitSingleAnswer}
          pendingSingleIndex={pendingSingleIndex}
          answered={answers.length > currentIndex}
        />
      )}
      {view === 'quiz' && status === 'active' && (
        <div className="question-actions">
          <div className="question-actions__inner">
            {answered ? (
              <button className="next-btn" onClick={nextQuestion}>
                {isLast ? 'See Results →' : 'Next →'}
              </button>
            ) : (
              <button
                className="submit-btn"
                onClick={isMultiMode ? submitMultiAnswer : submitSingleAnswer}
                disabled={!canSubmit}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      )}
      {view === 'quiz' && status === 'results' && (
        <ResultsScreen
          questions={questions}
          answers={answers}
          onStartNew={startQuiz}
          onHome={resetQuiz}
        />
      )}
      {view === 'quiz' && status === 'idle' && (
        <StartScreen
          onStart={startQuiz}
          isLoading={isLoading}
          error={error}
          onViewStats={() => setView('stats')}
          onStartHard={startPracticeHardQuiz}
          questionCount={questionsCount}
          onPrivacy={() => setView('privacy')}
          onTerms={() => setView('terms')}
          onCookies={() => setView('cookies')}
          onDisclaimer={() => setView('disclaimer')}
        />
      )}
    </>
  )
}

export default App
