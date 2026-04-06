import { useState, useEffect } from 'react'
import { fetchQuestionsCount } from '../api/client'

interface UseQuestionsCountReturn {
  count: number
  isLoading: boolean
  error: string | null
}

export function useQuestionsCount(): UseQuestionsCountReturn {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchQuestionsCount()
        if (cancelled) return
        setCount(result)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load questions count')
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

  return { count, isLoading, error }
}
