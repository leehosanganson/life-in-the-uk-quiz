import { vi, describe, it, expect, afterEach } from 'vitest'
import { shuffleArray } from './shuffle'

describe('shuffleArray', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a new array of the same length', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffleArray(input)
    expect(result).toHaveLength(input.length)
    expect(result).not.toBe(input)
  })

  it('contains exactly the same elements as the original', () => {
    const input = ['a', 'b', 'c', 'd']
    const result = shuffleArray(input)
    expect([...result].sort()).toEqual([...input].sort())
  })

  it('does not mutate the original array', () => {
    const input = [10, 20, 30, 40]
    const copy = [...input]
    shuffleArray(input)
    expect(input).toEqual(copy)
  })

  it('returns an empty array when given an empty array', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('returns a single-element array unchanged', () => {
    expect(shuffleArray([42])).toEqual([42])
  })

  it('produces the expected permutation for a known random sequence (Fisher-Yates correctness)', () => {
    // For array [0, 1, 2, 3] (length 4), Fisher-Yates iterates i = 3, 2, 1
    // We control Math.random() to return known values:
    //   i=3: Math.random() -> 0.75  => j = floor(0.75 * 4) = 3  => swap(3,3): [0,1,2,3]
    //   i=2: Math.random() -> 0.0   => j = floor(0.0  * 3) = 0  => swap(2,0): [2,1,0,3]
    //   i=1: Math.random() -> 0.5   => j = floor(0.5  * 2) = 1  => swap(1,1): [2,1,0,3]
    const randoms = [0.75, 0.0, 0.5]
    let callCount = 0
    vi.spyOn(Math, 'random').mockImplementation(() => randoms[callCount++])

    const result = shuffleArray([0, 1, 2, 3])
    expect(result).toEqual([2, 1, 0, 3])
  })
})
