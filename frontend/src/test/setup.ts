import '@testing-library/jest-dom'

interface WindowWithEnv extends Window {
  __ENV__?: Record<string, string>
}

// Ensure window.__ENV__ is undefined in tests so appConfig uses its hardcoded defaults
;(window as WindowWithEnv).__ENV__ = undefined
