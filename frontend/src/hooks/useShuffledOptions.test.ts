import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useShuffledOptions } from './useShuffledOptions'
import * as shuffleModule from '../utils/shuffle'
import type { Question } from '../types'

// Single-answer question with 4 options (answerIndex = 2)
const singleQuestion: Question = {
  id: 'q1',
  text: 'What is the capital of the UK?',
  options: ['Edinburgh', 'Cardiff', 'London', 'Belfast'],
  answerIndex: 2,
  category: 'Geography',
}

// Multi-answer question with 4 options (answerIndices = [0, 2])
const multiQuestion: Question = {
  id: 'q2',
  text: 'Which are correct?',
  options: ['A', 'B', 'C', 'D'],
  answerIndex: 0,
  answerIndices: [0, 2],
  category: 'Test',
}

describe('useShuffledOptions', () => {
  beforeEach(() => {
    // Mock shuffleArray to return a known permutation [1, 3, 0, 2]
    // i.e. shuffled position 0 -> original 1 (Cardiff)
    //      shuffled position 1 -> original 3 (Belfast)
    //      shuffled position 2 -> original 0 (Edinburgh)
    //      shuffled position 3 -> original 2 (London)
    vi.spyOn(shuffleModule, 'shuffleArray').mockReturnValue([1, 3, 0, 2])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns shuffledOptions in the mocked order', () => {
    const { result } = renderHook(() => useShuffledOptions(singleQuestion))
    expect(result.current.shuffledOptions).toEqual(['Cardiff', 'Belfast', 'Edinburgh', 'London'])
  })

  it('returns correct shuffledAnswerIndex for single-answer question', () => {
    // answerIndex = 2 (London) → shuffled position 3
    const { result } = renderHook(() => useShuffledOptions(singleQuestion))
    expect(result.current.shuffledAnswerIndex).toBe(3)
  })

  it('returns empty shuffledAnswerIndices for single-answer question', () => {
    const { result } = renderHook(() => useShuffledOptions(singleQuestion))
    expect(result.current.shuffledAnswerIndices).toEqual([])
  })

  it('returns correct shuffledAnswerIndices for multi-answer question', () => {
    // answerIndices = [0, 2]
    // original 0 (A) → shuffled position 2
    // original 2 (C) → shuffled position 3
    const { result } = renderHook(() => useShuffledOptions(multiQuestion))
    expect(result.current.shuffledAnswerIndices).toEqual([2, 3])
  })

  it('originalIndexOf maps shuffled positions back to original indices', () => {
    const { result } = renderHook(() => useShuffledOptions(singleQuestion))
    expect(result.current.originalIndexOf(0)).toBe(1)
    expect(result.current.originalIndexOf(1)).toBe(3)
    expect(result.current.originalIndexOf(2)).toBe(0)
    expect(result.current.originalIndexOf(3)).toBe(2)
  })

  it('memo is stable across re-renders with the same question', () => {
    const { result, rerender } = renderHook(() => useShuffledOptions(singleQuestion))
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
    // shuffleArray should only have been called once
    expect(shuffleModule.shuffleArray).toHaveBeenCalledTimes(1)
  })

  it('recomputes when question id changes', () => {
    let question = singleQuestion
    const { result, rerender } = renderHook(() => useShuffledOptions(question))

    const first = result.current
    question = { ...multiQuestion, id: 'q99' }
    rerender()

    expect(result.current).not.toBe(first)
    // shuffleArray called once for first render, once for the new question id
    expect(shuffleModule.shuffleArray).toHaveBeenCalledTimes(2)
  })
})

describe('all-of-the-above pinning', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Question with AOTA at original index 3 (last)
  // options: ['Option A', 'Option B', 'Option C', 'All of the above']
  const aotaQuestion: Question = {
    id: 'aota1',
    text: 'Which applies?',
    options: ['Option A', 'Option B', 'Option C', 'All of the above'],
    answerIndex: 3,
    category: 'Test',
  }

  it('pins AOTA to last position when shuffled to non-last position', () => {
    // shuffleArray returns [3, 0, 1, 2] — AOTA (orig index 3) ends up at shuffled pos 0
    vi.spyOn(shuffleModule, 'shuffleArray').mockReturnValue([3, 0, 1, 2])
    const { result } = renderHook(() => useShuffledOptions(aotaQuestion))
    const last = result.current.shuffledOptions[result.current.shuffledOptions.length - 1]
    expect(last).toBe('All of the above')
  })

  it('leaves order unchanged when AOTA is already in last position', () => {
    // shuffleArray returns [0, 1, 2, 3] — AOTA (orig index 3) already at last shuffled pos
    vi.spyOn(shuffleModule, 'shuffleArray').mockReturnValue([0, 1, 2, 3])
    const { result } = renderHook(() => useShuffledOptions(aotaQuestion))
    expect(result.current.shuffledOptions).toEqual([
      'Option A',
      'Option B',
      'Option C',
      'All of the above',
    ])
  })

  it('pins AOTA case-insensitively (uppercase text)', () => {
    const upperAotaQuestion: Question = {
      id: 'aota2',
      text: 'Which applies?',
      options: ['Option A', 'Option B', 'Option C', 'ALL OF THE ABOVE extra words'],
      answerIndex: 3,
      category: 'Test',
    }
    // shuffleArray returns [3, 0, 1, 2] — AOTA at shuffled pos 0
    vi.spyOn(shuffleModule, 'shuffleArray').mockReturnValue([3, 0, 1, 2])
    const { result } = renderHook(() => useShuffledOptions(upperAotaQuestion))
    const last = result.current.shuffledOptions[result.current.shuffledOptions.length - 1]
    expect(last).toBe('ALL OF THE ABOVE extra words')
  })

  it('does not affect order when no AOTA option is present', () => {
    // shuffleArray returns [1, 3, 0, 2] — standard permutation, no AOTA
    vi.spyOn(shuffleModule, 'shuffleArray').mockReturnValue([1, 3, 0, 2])
    const { result } = renderHook(() => useShuffledOptions(singleQuestion))
    expect(result.current.shuffledOptions).toEqual(['Cardiff', 'Belfast', 'Edinburgh', 'London'])
  })

  it('returns correct shuffledAnswerIndex when AOTA is the correct answer and is pinned', () => {
    // shuffleArray returns [3, 0, 1, 2] — AOTA (orig 3) at pos 0, swap to last (pos 3)
    vi.spyOn(shuffleModule, 'shuffleArray').mockReturnValue([3, 0, 1, 2])
    const { result } = renderHook(() => useShuffledOptions(aotaQuestion))
    // AOTA is pinned to last position (index 3), which is where answerIndex should point
    expect(result.current.shuffledAnswerIndex).toBe(3)
  })

  it('returns correct shuffledAnswerIndex when a non-AOTA option is the correct answer', () => {
    // Question where AOTA is at orig index 3 but answer is orig index 1 ('Option B')
    const nonAotaAnswerQuestion: Question = {
      id: 'aota3',
      text: 'Which applies?',
      options: ['Option A', 'Option B', 'Option C', 'All of the above'],
      answerIndex: 1,
      category: 'Test',
    }
    // shuffleArray returns [3, 0, 1, 2]:
    //   pos 0 -> orig 3 (AOTA) → swapped to pos 3
    //   pos 3 -> orig 2 (Option C) → swapped to pos 0
    // After swap: [2, 0, 1, 3]
    // 'Option B' (orig 1) is at shuffled pos 2
    vi.spyOn(shuffleModule, 'shuffleArray').mockReturnValue([3, 0, 1, 2])
    const { result } = renderHook(() => useShuffledOptions(nonAotaAnswerQuestion))
    // After pinning swap: shuffledOrder = [2, 0, 1, 3]
    // orig 1 (Option B) is at shuffled position 2
    expect(result.current.shuffledAnswerIndex).toBe(2)
  })
})
