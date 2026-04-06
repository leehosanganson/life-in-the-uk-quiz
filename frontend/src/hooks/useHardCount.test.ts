import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useHardCount } from './useHardCount'
import * as client from '../api/client'

vi.mock('../api/client')

describe('useHardCount', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('practiceHardCount is count of questions with totalAttempts >= 1', async () => {
    vi.spyOn(client, 'fetchStats').mockResolvedValue([
      { questionId: 'q1', totalAttempts: 10, correctCount: 9 }, // attempted
      { questionId: 'q2', totalAttempts: 5, correctCount: 2 }, // attempted
      { questionId: 'q3', totalAttempts: 0, correctCount: 0 }, // not attempted
      { questionId: 'q4', totalAttempts: 1, correctCount: 1 }, // attempted
    ])

    const { result } = renderHook(() => useHardCount())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // 3 questions have totalAttempts >= 1
    expect(result.current.practiceHardCount).toBe(3)
  })

  it('practiceHardCount is 0 when no stats', async () => {
    vi.spyOn(client, 'fetchStats').mockResolvedValue([])

    const { result } = renderHook(() => useHardCount())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.practiceHardCount).toBe(0)
  })

  it('hardCount only counts questions below 75% accuracy', async () => {
    vi.spyOn(client, 'fetchStats').mockResolvedValue([
      { questionId: 'q1', totalAttempts: 10, correctCount: 7 }, // 70% — hard
      { questionId: 'q2', totalAttempts: 4, correctCount: 3 }, // 75% — not hard
      { questionId: 'q3', totalAttempts: 2, correctCount: 1 }, // 50% — hard
    ])

    const { result } = renderHook(() => useHardCount())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.hardCount).toBe(2)
  })
})
