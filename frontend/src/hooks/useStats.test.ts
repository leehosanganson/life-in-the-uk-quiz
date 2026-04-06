import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useStats } from './useStats'
import * as client from '../api/client'

vi.mock('../api/client')

const mockFetchHardestStats = vi.mocked(client.fetchHardestStats)
const mockFetchEasiestStats = vi.mocked(client.fetchEasiestStats)
const mockFetchStatsCount = vi.mocked(client.fetchStatsCount)

const mockHardest: client.RankedQuestion[] = [
  {
    questionId: 'q2',
    text: 'Question 2?',
    category: 'Culture',
    totalAttempts: 4,
    correctCount: 1,
    accuracy: 25,
  },
  {
    questionId: 'q1',
    text: 'Question 1?',
    category: 'History',
    totalAttempts: 10,
    correctCount: 8,
    accuracy: 80,
  },
]

const mockEasiest: client.RankedQuestion[] = [
  {
    questionId: 'q1',
    text: 'Question 1?',
    category: 'History',
    totalAttempts: 10,
    correctCount: 8,
    accuracy: 80,
  },
  {
    questionId: 'q2',
    text: 'Question 2?',
    category: 'Culture',
    totalAttempts: 4,
    correctCount: 1,
    accuracy: 25,
  },
]

describe('useStats', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('starts in loading state', () => {
    mockFetchHardestStats.mockReturnValue(new Promise(() => {}))
    mockFetchEasiestStats.mockReturnValue(new Promise(() => {}))
    mockFetchStatsCount.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useStats())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.hardestRows).toEqual([])
    expect(result.current.easiestRows).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('resolves rows with correct accuracy values', async () => {
    mockFetchHardestStats.mockResolvedValue(mockHardest)
    mockFetchEasiestStats.mockResolvedValue(mockEasiest)
    mockFetchStatsCount.mockResolvedValue(2)

    const { result } = renderHook(() => useStats())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.hardestRows).toHaveLength(2)

    const q1Row = result.current.hardestRows.find((r) => r.id === 'q1')
    expect(q1Row?.accuracy).toBe(80)
    expect(q1Row?.totalAttempts).toBe(10)
    expect(q1Row?.correctCount).toBe(8)

    const q2Row = result.current.hardestRows.find((r) => r.id === 'q2')
    expect(q2Row?.accuracy).toBe(25)
  })

  it('returns only rows provided by the API', async () => {
    const singleItem: client.RankedQuestion[] = [
      {
        questionId: 'q1',
        text: 'Question 1?',
        category: 'History',
        totalAttempts: 5,
        correctCount: 4,
        accuracy: 80,
      },
    ]
    mockFetchHardestStats.mockResolvedValue(singleItem)
    mockFetchEasiestStats.mockResolvedValue(singleItem)
    mockFetchStatsCount.mockResolvedValue(2)

    const { result } = renderHook(() => useStats())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.hardestRows).toHaveLength(1)
    expect(result.current.hardestRows.find((r) => r.id === 'q2')).toBeUndefined()
    expect(result.current.hardestRows.find((r) => r.id === 'q3')).toBeUndefined()
  })

  it('preserves API ordering for hardestRows and easiestRows', async () => {
    mockFetchHardestStats.mockResolvedValue(mockHardest)
    mockFetchEasiestStats.mockResolvedValue(mockEasiest)
    mockFetchStatsCount.mockResolvedValue(2)

    const { result } = renderHook(() => useStats())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.hardestRows).toHaveLength(2)
    expect(result.current.hardestRows[0].id).toBe('q2') // 25% — hardest first
    expect(result.current.hardestRows[0].accuracy).toBe(25)
    expect(result.current.hardestRows[1].id).toBe('q1') // 80%
    expect(result.current.hardestRows[1].accuracy).toBe(80)

    expect(result.current.easiestRows).toHaveLength(2)
    expect(result.current.easiestRows[0].id).toBe('q1') // 80% — easiest first
    expect(result.current.easiestRows[1].id).toBe('q2') // 25%
  })

  it('sets error on rejection', async () => {
    mockFetchHardestStats.mockRejectedValue(new Error('Network error'))
    mockFetchEasiestStats.mockResolvedValue([])
    mockFetchStatsCount.mockResolvedValue(2)

    const { result } = renderHook(() => useStats())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Network error')
    expect(result.current.hardestRows).toEqual([])
    expect(result.current.easiestRows).toEqual([])
  })

  it('returns all rows provided by the API without capping', async () => {
    const sixtyItems: client.RankedQuestion[] = Array.from({ length: 60 }, (_, i) => ({
      questionId: `q${i}`,
      text: `Question ${i}`,
      category: 'Test',
      totalAttempts: 10,
      correctCount: i,
      accuracy: Math.round((i / 10) * 100),
    }))
    mockFetchHardestStats.mockResolvedValue(sixtyItems)
    mockFetchEasiestStats.mockResolvedValue(sixtyItems)
    mockFetchStatsCount.mockResolvedValue(2)

    const { result } = renderHook(() => useStats())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    // Capping is now enforced by SQL LIMIT 50 on the server; the hook passes through all received rows
    expect(result.current.hardestRows.length).toBe(60)
    expect(result.current.easiestRows.length).toBe(60)
  })

  it('exposes totalTracked from the count endpoint', async () => {
    mockFetchHardestStats.mockResolvedValue([])
    mockFetchEasiestStats.mockResolvedValue([])
    mockFetchStatsCount.mockResolvedValue(7)

    const { result } = renderHook(() => useStats())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.totalTracked).toBe(7)
  })
})
