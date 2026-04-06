export interface Question {
  id: string
  text: string
  options: string[]
  answerIndex: number
  answerIndices?: number[]
  category: string
  explanation?: string
}

export type QuizStatus = 'idle' | 'active' | 'results'

export interface SingleAnswerRecord {
  questionId: string
  selectedIndex: number
  correct: boolean
}

export interface MultiAnswerRecord {
  questionId: string
  selectedIndices: number[]
  correct: boolean
}

export type AnswerRecord = SingleAnswerRecord | MultiAnswerRecord

export function isMultiAnswer(q: Question): q is Question & { answerIndices: number[] } {
  return Array.isArray(q.answerIndices) && q.answerIndices.length >= 2
}

export function isMultiAnswerRecord(r: AnswerRecord): r is MultiAnswerRecord {
  return 'selectedIndices' in r
}

export interface QuestionStat {
  questionId: string
  totalAttempts: number
  correctCount: number
}
