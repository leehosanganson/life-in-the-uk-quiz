import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useQuiz } from './useQuiz'
import * as client from '../api/client'

vi.mock('../api/client')

const mockQuestions = [
  { id: 'q1', text: 'Q1?', options: ['A', 'B', 'C', 'D'], answerIndex: 0, category: 'Test' },
  { id: 'q2', text: 'Q2?', options: ['A', 'B', 'C', 'D'], answerIndex: 1, category: 'Test' },
]

describe('useQuiz', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(client, 'submitAnswer').mockResolvedValue(undefined)
  })

  it('initial state is idle', () => {
    const { result } = renderHook(() => useQuiz())
    expect(result.current.status).toBe('idle')
    expect(result.current.questions).toEqual([])
    expect(result.current.currentIndex).toBe(0)
  })

  it('startQuiz transitions to active', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    expect(result.current.status).toBe('active')
    expect(result.current.questions).toHaveLength(2)
  })

  it('submitSingleAnswer records correct answer', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => result.current.setPendingSingle(0))
    act(() => result.current.submitSingleAnswer()) // answerIndex is 0
    expect(result.current.answers[0].correct).toBe(true)
  })

  it('submitSingleAnswer records incorrect answer', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => result.current.setPendingSingle(1))
    act(() => result.current.submitSingleAnswer()) // wrong index
    expect(result.current.answers[0].correct).toBe(false)
  })

  it('submitSingleAnswer submits the answer exactly once', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const submitSpy = vi.spyOn(client, 'submitAnswer').mockResolvedValue(undefined)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => result.current.setPendingSingle(0))
    act(() => result.current.submitSingleAnswer())
    expect(submitSpy).toHaveBeenCalledTimes(1)
    expect(submitSpy).toHaveBeenCalledWith('q1', true)
  })

  it('nextQuestion advances index', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => result.current.setPendingSingle(0))
    act(() => result.current.submitSingleAnswer())
    act(() => {
      result.current.nextQuestion()
    })
    expect(result.current.currentIndex).toBe(1)
  })

  it('nextQuestion on last question transitions to results', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => result.current.setPendingSingle(0))
    act(() => result.current.submitSingleAnswer())
    act(() => {
      result.current.nextQuestion()
    })
    act(() => result.current.setPendingSingle(1))
    act(() => result.current.submitSingleAnswer())
    act(() => {
      result.current.nextQuestion()
    })
    expect(result.current.status).toBe('results')
  })

  it('resetQuiz returns to idle', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.resetQuiz()
    })
    expect(result.current.status).toBe('idle')
    expect(result.current.questions).toEqual([])
  })

  it('error state on fetch failure', async () => {
    vi.spyOn(client, 'fetchQuiz').mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.status).toBe('idle')
  })

  it('startQuiz calls fetchQuiz with 24', async () => {
    const spy = vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    expect(spy).toHaveBeenCalledWith(24)
  })
})

describe('startPracticeHardQuiz', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(client, 'submitAnswer').mockResolvedValue(undefined)
  })

  it('startPracticeHardQuiz transitions to active', async () => {
    vi.spyOn(client, 'fetchPracticeHardQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startPracticeHardQuiz()
    })
    expect(result.current.status).toBe('active')
    expect(result.current.questions).toHaveLength(2)
  })

  it('startPracticeHardQuiz sets error on rejection', async () => {
    vi.spyOn(client, 'fetchPracticeHardQuiz').mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startPracticeHardQuiz()
    })
    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.status).toBe('idle')
  })
})

const mockMultiQuestion = {
  id: 'mul001',
  text: 'Which are correct?',
  options: ['A', 'B', 'C', 'D'],
  answerIndex: 0,
  answerIndices: [0, 2],
  category: 'Test',
}

describe('multi-answer', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(client, 'submitAnswer').mockResolvedValue(undefined)
  })

  it('togglePendingIndex(0) adds 0 to pendingIndices', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue([mockMultiQuestion])
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.togglePendingIndex(0)
    })
    expect(result.current.pendingIndices).toEqual([0])
  })

  it('togglePendingIndex(0) twice results in empty pendingIndices (toggle off)', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue([mockMultiQuestion])
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.togglePendingIndex(0)
    })
    act(() => {
      result.current.togglePendingIndex(0)
    })
    expect(result.current.pendingIndices).toEqual([])
  })

  it('submitMultiAnswer records a MultiAnswerRecord with correct: true when pendingIndices matches answerIndices exactly', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue([mockMultiQuestion])
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.togglePendingIndex(0)
    })
    act(() => {
      result.current.togglePendingIndex(2)
    })
    act(() => {
      result.current.submitMultiAnswer()
    })
    expect(result.current.answers[0].correct).toBe(true)
    expect(result.current.answers[0]).toMatchObject({
      questionId: 'mul001',
      selectedIndices: [0, 2],
    })
  })

  it('submitMultiAnswer records correct: false when wrong indices selected', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue([mockMultiQuestion])
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.togglePendingIndex(1)
    }) // wrong index
    act(() => {
      result.current.submitMultiAnswer()
    })
    expect(result.current.answers[0].correct).toBe(false)
  })

  it('submitMultiAnswer is a no-op when pendingIndices is empty', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue([mockMultiQuestion])
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.submitMultiAnswer()
    })
    expect(result.current.answers).toHaveLength(0)
  })

  it('after submitMultiAnswer, pendingIndices resets to []', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue([mockMultiQuestion])
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.togglePendingIndex(0)
    })
    act(() => {
      result.current.togglePendingIndex(2)
    })
    act(() => {
      result.current.submitMultiAnswer()
    })
    expect(result.current.pendingIndices).toEqual([])
  })

  it('setPendingSingle is a no-op on multi-answer question', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue([mockMultiQuestion])
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.setPendingSingle(0)
    })
    expect(result.current.pendingSingleIndex).toBeNull()
  })

  it('nextQuestion resets pendingIndices', async () => {
    const twoQuestions = [mockMultiQuestion, mockQuestions[1]]
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(twoQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.togglePendingIndex(0)
    })
    expect(result.current.pendingIndices).toEqual([0])
    act(() => {
      result.current.nextQuestion()
    })
    expect(result.current.pendingIndices).toEqual([])
  })
})

describe('single-answer pending state', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(client, 'submitAnswer').mockResolvedValue(undefined)
  })

  it('setPendingSingle sets pendingSingleIndex', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.setPendingSingle(2)
    })
    expect(result.current.pendingSingleIndex).toBe(2)
  })

  it('setPendingSingle replaces previous pending', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.setPendingSingle(1)
    })
    act(() => {
      result.current.setPendingSingle(3)
    })
    expect(result.current.pendingSingleIndex).toBe(3)
  })

  it('submitSingleAnswer commits and clears pendingSingleIndex', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.setPendingSingle(0)
    })
    act(() => {
      result.current.submitSingleAnswer()
    })
    expect(result.current.answers[0].correct).toBe(true)
    expect(result.current.pendingSingleIndex).toBeNull()
  })

  it('submitSingleAnswer is no-op when pendingSingleIndex is null', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.submitSingleAnswer()
    })
    expect(result.current.answers).toHaveLength(0)
  })

  it('nextQuestion resets pendingSingleIndex', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.setPendingSingle(1)
    })
    act(() => {
      result.current.nextQuestion()
    })
    expect(result.current.pendingSingleIndex).toBeNull()
  })

  it('setPendingSingle called twice with same index clears pendingSingleIndex (toggle off)', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.setPendingSingle(0)
    })
    expect(result.current.pendingSingleIndex).toBe(0)
    act(() => {
      result.current.setPendingSingle(0)
    })
    expect(result.current.pendingSingleIndex).toBeNull()
  })

  it('setPendingSingle with a different index replaces selection without toggling off', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.setPendingSingle(1)
    })
    act(() => {
      result.current.setPendingSingle(2)
    })
    expect(result.current.pendingSingleIndex).toBe(2)
  })

  it('setPendingSingle is a no-op when question already answered', async () => {
    vi.spyOn(client, 'fetchQuiz').mockResolvedValue(mockQuestions)
    const { result } = renderHook(() => useQuiz())
    await act(async () => {
      await result.current.startQuiz()
    })
    act(() => {
      result.current.setPendingSingle(0)
    })
    act(() => {
      result.current.submitSingleAnswer()
    })
    act(() => {
      result.current.setPendingSingle(1)
    })
    expect(result.current.pendingSingleIndex).toBeNull()
  })
})
