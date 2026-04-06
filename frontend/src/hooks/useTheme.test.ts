import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to "auto" when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('auto')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('reads persisted "light" from localStorage', () => {
    localStorage.setItem('theme', 'light')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('reads persisted "dark" from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('ignores invalid localStorage value and defaults to "auto"', () => {
    localStorage.setItem('theme', 'invalid')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('auto')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('setTheme("light") updates state, localStorage, and data-theme', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('light')
    })
    expect(result.current.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('setTheme("dark") updates state, localStorage, and data-theme', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('setTheme("auto") removes data-theme attribute and writes to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('dark')
    })
    act(() => {
      result.current.setTheme('auto')
    })
    expect(result.current.theme).toBe('auto')
    expect(localStorage.getItem('theme')).toBe('auto')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
