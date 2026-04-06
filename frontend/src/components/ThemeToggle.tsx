import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../hooks/useTheme'
import type { Theme } from '../hooks/useTheme'

const BUTTONS: { value: Theme; label: string; ariaLabel: string; title: string }[] = [
  { value: 'light', label: '☀', ariaLabel: 'Switch to light theme', title: 'Light mode' },
  { value: 'auto', label: '⚙', ariaLabel: 'Switch to automatic theme', title: 'Auto (system)' },
  { value: 'dark', label: '☽', ariaLabel: 'Switch to dark theme', title: 'Dark mode' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!expanded) return

    const handler = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setExpanded(false)
      }
    }

    document.addEventListener('pointerdown', handler)
    return () => {
      document.removeEventListener('pointerdown', handler)
    }
  }, [expanded])

  const activeButton = BUTTONS.find((b) => b.value === theme) ?? BUTTONS[1]

  return (
    <div className="theme-toggle" role="group" aria-label="Theme" ref={containerRef}>
      <button
        type="button"
        className="theme-btn theme-toggle__trigger"
        aria-pressed="true"
        aria-expanded={expanded}
        aria-haspopup="true"
        aria-label={activeButton.ariaLabel}
        title={activeButton.title}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {activeButton.label}
      </button>
      {expanded && (
        <div className="theme-toggle__dropdown">
          {BUTTONS.map(({ value, label, ariaLabel, title }) => (
            <button
              key={value}
              type="button"
              className={`theme-btn${theme === value ? ' theme-btn--active' : ' theme-btn-enter'}`}
              aria-pressed={theme === value ? 'true' : 'false'}
              aria-label={ariaLabel}
              title={title}
              onClick={() => {
                setTheme(value)
                setExpanded(false)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
