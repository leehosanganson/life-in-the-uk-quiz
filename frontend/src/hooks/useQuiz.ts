import { useState, useCallback } from 'react'
import type { Question, QuizStatus, AnswerRecord, MultiAnswerRecord } from '../types'
import { isMultiAnswer } from '../types'
import { fetchQuiz, fetchPracticeHardQuiz, submitAnswer } from '../api/client'

interface UseQuizReturn {
  status: QuizStatus
  questions: Question[]
  currentIndex: number
  answers: AnswerRecord[]
  isLoading: boolean
  error: string | null
  pendingIndices: number[]
  pendingSingleIndex: number | null
  startQuiz: () => Promise<void>
  startPracticeHardQuiz: () => Promise<void>
  setPendingSingle: (index: number) => void
  submitSingleAnswer: () => void
  nextQuestion: () => void
  resetQuiz: () => void
  togglePendingIndex: (index: number) => void
  submitMultiAnswer: () => void
}

export function useQuiz(): UseQuizReturn {
  const [status, setStatus] = useState<QuizStatus>('idle')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingIndices, setPendingIndices] = useState<number[]>([])
  const [pendingSingleIndex, setPendingSingleIndex] = useState<number | null>(null)

  const _startWithFetcher = useCallback(async (fetcher: () => Promise<Question[]>) => {
    setIsLoading(true)
    setError(null)
    try {
      const qs = await fetcher()
      setQuestions(qs)
      setCurrentIndex(0)
      setAnswers([])
      setPendingIndices([])
      setPendingSingleIndex(null)
      setStatus('active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz')
      setStatus('idle')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startQuiz = useCallback(() => _startWithFetcher(() => fetchQuiz(24)), [_startWithFetcher])

  const startPracticeHardQuiz = useCallback(
    () => _startWithFetcher(() => fetchPracticeHardQuiz()),
    [_startWithFetcher]
  )

  const setPendingSingle = useCallback(
    (index: number) => {
      if (isMultiAnswer(questions[currentIndex])) return
      if (answers.length > currentIndex) return
      setPendingSingleIndex((prev) => (prev === index ? null : index))
    },
    [questions, currentIndex, answers]
  )

  const submitSingleAnswer = useCallback(() => {
    if (pendingSingleIndex === null) return
    if (isMultiAnswer(questions[currentIndex])) return
    if (answers.length > currentIndex) return
    const question = questions[currentIndex]
    const correct = question.answerIndex === pendingSingleIndex
    submitAnswer(question.id, correct)
    setAnswers((prev) => [
      ...prev,
      { questionId: question.id, selectedIndex: pendingSingleIndex, correct },
    ])
    setPendingSingleIndex(null)
  }, [pendingSingleIndex, currentIndex, questions, answers])

  const togglePendingIndex = useCallback((index: number) => {
    setPendingIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      }
      return [...prev, index]
    })
  }, [])

  const submitMultiAnswer = useCallback(() => {
    // Guard: no pending indices
    if (pendingIndices.length === 0) return
    const question = questions[currentIndex]
    // Guard: must be a multi-answer question
    if (!isMultiAnswer(question)) return
    // Guard: only one answer per question
    if (answers.length > currentIndex) return

    // Compute correctness: sort both arrays and compare element-by-element
    const sortedPending = [...pendingIndices].sort((a, b) => a - b)
    const sortedAnswer = [...question.answerIndices].sort((a, b) => a - b)
    const correct =
      sortedPending.length === sortedAnswer.length &&
      sortedPending.every((val, i) => val === sortedAnswer[i])

    const record: MultiAnswerRecord = {
      questionId: question.id,
      selectedIndices: pendingIndices,
      correct,
    }
    submitAnswer(question.id, correct) // fire-and-forget
    setAnswers((prev) => [...prev, record])
    setPendingIndices([])
  }, [pendingIndices, questions, currentIndex, answers])

  const nextQuestion = useCallback(() => {
    const nextIndex = currentIndex + 1
    setPendingIndices([])
    setPendingSingleIndex(null)
    if (nextIndex >= questions.length) {
      setStatus('results')
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [currentIndex, questions.length])

  const resetQuiz = useCallback(() => {
    setStatus('idle')
    setQuestions([])
    setCurrentIndex(0)
    setAnswers([])
    setError(null)
    setIsLoading(false)
    setPendingIndices([])
    setPendingSingleIndex(null)
  }, [])

  return {
    status,
    questions,
    currentIndex,
    answers,
    isLoading,
    error,
    pendingIndices,
    pendingSingleIndex,
    startQuiz,
    startPracticeHardQuiz,
    setPendingSingle,
    submitSingleAnswer,
    nextQuestion,
    resetQuiz,
    togglePendingIndex,
    submitMultiAnswer,
  }
}
