import { useState, useEffect } from 'react'

export type Theme = 'auto' | 'light' | 'dark'

const VALID_THEMES: Theme[] = ['auto', 'light', 'dark']
const STORAGE_KEY = 'theme'

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (VALID_THEMES as string[]).includes(stored)) {
      return stored as Theme
    }
  } catch {
    // localStorage unavailable
  }
  return 'auto'
}

function applyTheme(theme: Theme): void {
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage unavailable
    }
    applyTheme(theme)
  }, [theme])

  return { theme, setTheme: setThemeState }
}
