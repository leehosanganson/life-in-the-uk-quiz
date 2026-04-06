import { useMemo } from 'react'
import type { Question } from '../types'
import { shuffleArray } from '../utils/shuffle'

export interface UseShuffledOptionsResult {
  shuffledOptions: string[]
  shuffledAnswerIndex: number
  shuffledAnswerIndices: number[]
  originalIndexOf: (shuffledIdx: number) => number
}

/**
 * Shuffles the options of a question once per question id (memoised).
 * Returns shuffled options and helpers to translate shuffled indices back to
 * original-index space (which is what useQuiz / the answer-checking logic uses).
 */
export function useShuffledOptions(question: Question): UseShuffledOptionsResult {
  return useMemo(() => {
    // Build an array of original indices then shuffle it.
    // shuffledOrder[i] = original index of the option now at shuffled position i
    const originalIndices = question.options.map((_, i) => i)
    const shuffledOrder = shuffleArray(originalIndices)

    // Pin "all of the above" option to the last position after shuffling.
    const isAllOfTheAbove = (text: string): boolean => /^all of the above/i.test(text.trim())

    const aotaOriginalIndex = question.options.findIndex((opt) => isAllOfTheAbove(opt))

    if (aotaOriginalIndex !== -1) {
      const aotaCurrentPos = shuffledOrder.indexOf(aotaOriginalIndex)
      const lastPos = shuffledOrder.length - 1
      if (aotaCurrentPos !== lastPos) {
        ;[shuffledOrder[aotaCurrentPos], shuffledOrder[lastPos]] = [
          shuffledOrder[lastPos],
          shuffledOrder[aotaCurrentPos],
        ]
      }
    }

    const shuffledOptions = shuffledOrder.map((origIdx) => question.options[origIdx])

    // originalIndexOf: given a position in the shuffled array, return the
    // original array index.
    const originalIndexOf = (shuffledIdx: number): number => shuffledOrder[shuffledIdx]

    // Map the correct answer index into shuffled space.
    const shuffledAnswerIndex = shuffledOrder.indexOf(question.answerIndex)

    // Map all correct-answer indices (multi-answer) into shuffled space.
    const shuffledAnswerIndices = (question.answerIndices ?? []).map((origIdx) =>
      shuffledOrder.indexOf(origIdx)
    )

    return {
      shuffledOptions,
      shuffledAnswerIndex,
      shuffledAnswerIndices,
      originalIndexOf,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])
}
