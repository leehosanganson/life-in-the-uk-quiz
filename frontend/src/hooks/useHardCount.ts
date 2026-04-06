import { useState, useEffect } from 'react'
import { fetchStats } from '../api/client'

interface UseHardCountReturn {
  hardCount: number
  practiceHardCount: number
  isLoading: boolean
  error: string | null
}

export function useHardCount(): UseHardCountReturn {
  const [hardCount, setHardCount] = useState(0)
  const [practiceHardCount, setPracticeHardCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const stats = await fetchStats()
        if (cancelled) return

        const count = stats.filter(
          (s) => s.totalAttempts >= 1 && s.correctCount / s.totalAttempts < 0.75
        ).length

        setHardCount(count)

        const practiceCount = stats.filter((s) => s.totalAttempts >= 1).length
        setPracticeHardCount(practiceCount)
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

  return { hardCount, practiceHardCount, isLoading, error }
}
