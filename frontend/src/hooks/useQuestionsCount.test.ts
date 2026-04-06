import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useQuestionsCount } from './useQuestionsCount'
import * as client from '../api/client'

vi.mock('../api/client')

describe('useQuestionsCount', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('resolves successfully — count equals the mocked value and isLoading is false', async () => {
    vi.spyOn(client, 'fetchQuestionsCount').mockResolvedValue(42)

    const { result } = renderHook(() => useQuestionsCount())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.count).toBe(42)
    expect(result.current.error).toBeNull()
  })

  it('rejects — error is set, isLoading is false, count remains 0', async () => {
    vi.spyOn(client, 'fetchQuestionsCount').mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useQuestionsCount())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.count).toBe(0)
    expect(result.current.error).toBe('Network error')
  })
})
