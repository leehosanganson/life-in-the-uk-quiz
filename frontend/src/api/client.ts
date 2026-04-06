import type { Question, QuestionStat } from '../types'

const BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? ''

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json() as Promise<T>
}

export async function fetchQuiz(count = 10): Promise<Question[]> {
  return fetchJSON<Question[]>(`${BASE}/api/quiz?count=${count}`)
}

export async function submitAnswer(questionId: string, correct: boolean): Promise<void> {
  try {
    await fetch(`${BASE}/api/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, correct }),
    })
  } catch {
    // Silently ignore statistics errors — non-critical
  }
}

export async function fetchAllQuestions(): Promise<Question[]> {
  return fetchJSON<Question[]>(`${BASE}/api/quiz/hard`)
}

export async function fetchStats(): Promise<QuestionStat[]> {
  return fetchJSON<QuestionStat[]>(`${BASE}/api/stats`)
}

export async function fetchPracticeHardQuiz(): Promise<Question[]> {
  return fetchJSON<Question[]>(`${BASE}/api/quiz/hard`)
}

export interface RankedQuestion {
  questionId: string
  text: string
  category: string
  totalAttempts: number
  correctCount: number
  accuracy: number
}

export async function fetchHardestStats(): Promise<RankedQuestion[]> {
  return fetchJSON<RankedQuestion[]>(`${BASE}/api/stats/hardest`)
}

export async function fetchEasiestStats(): Promise<RankedQuestion[]> {
  return fetchJSON<RankedQuestion[]>(`${BASE}/api/stats/easiest`)
}

export async function fetchStatsCount(): Promise<number> {
  const data = await fetchJSON<{ count: number }>(`${BASE}/api/stats/count`)
  return data.count
}

export async function fetchQuestionsCount(): Promise<number> {
  const data = await fetchJSON<{ count: number }>(`${BASE}/api/questions/count`)
  return data.count
}
