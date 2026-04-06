import { useState, useEffect } from 'react'
import { fetchHardestStats, fetchEasiestStats, fetchStatsCount } from '../api/client'

interface EnrichedRow {
  id: string
  text: string
  category: string
  totalAttempts: number
  correctCount: number
  accuracy: number | null
}

interface UseStatsReturn {
  hardestRows: EnrichedRow[]
  easiestRows: EnrichedRow[]
  isLoading: boolean
  error: string | null
  totalTracked: number
}

export function useStats(): UseStatsReturn {
  const [hardestRows, setHardestRows] = useState<EnrichedRow[]>([])
  const [easiestRows, setEasiestRows] = useState<EnrichedRow[]>([])
  const [totalTracked, setTotalTracked] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [hardest, easiest, count] = await Promise.all([
          fetchHardestStats(),
          fetchEasiestStats(),
          fetchStatsCount(),
        ])
        if (cancelled) return

        const hardestRows: EnrichedRow[] = hardest.map((r) => ({
          id: r.questionId,
          text: r.text,
          category: r.category,
          totalAttempts: r.totalAttempts,
          correctCount: r.correctCount,
          accuracy: r.accuracy,
        }))

        const easiestRows: EnrichedRow[] = easiest.map((r) => ({
          id: r.questionId,
          text: r.text,
          category: r.category,
          totalAttempts: r.totalAttempts,
          correctCount: r.correctCount,
          accuracy: r.accuracy,
        }))

        setHardestRows(hardestRows)
        setEasiestRows(easiestRows)
        setTotalTracked(count)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stats')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return { hardestRows, easiestRows, isLoading, error, totalTracked }
}
