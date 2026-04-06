import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders a single button in collapsed state (the active theme icon)', () => {
    render(<ThemeToggle />)
    expect(screen.getAllByRole('button').length).toBe(1)
  })

  it('trigger button has aria-expanded="false" initially', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('clicking trigger shows all three theme buttons', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument()
    // The "auto" label appears on both the trigger and in the dropdown; ensure at least one exists
    expect(screen.getAllByRole('button', { name: /auto/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument()
  })

  it('trigger button has aria-expanded="true" when expanded', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const trigger = screen.getByRole('button')
    await user.click(trigger)
    // Trigger is always rendered; aria-expanded should now be true
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking trigger renders a .theme-toggle__dropdown element', async () => {
    const user = userEvent.setup()
    const { container } = render(<ThemeToggle />)
    expect(container.querySelector('.theme-toggle__dropdown')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /auto/i }))
    expect(container.querySelector('.theme-toggle__dropdown')).toBeInTheDocument()
  })

  it('clicking a theme option applies that theme and collapses', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button', { name: /dark/i }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    // After selecting, should be collapsed again (single button)
    expect(screen.getAllByRole('button').length).toBe(1)
  })

  it('clicking the already-active theme option collapses without changing theme', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button'))
    // Click the active "Auto" button inside the dropdown (there are two: trigger + dropdown)
    const autoButtons = screen.getAllByRole('button', { name: /auto/i })
    // The dropdown button is the last one rendered
    await user.click(autoButtons[autoButtons.length - 1])
    // Should collapse
    expect(screen.getAllByRole('button').length).toBe(1)
    // Theme should remain unchanged (no data-theme set = auto)
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('clicking outside collapses the picker', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button'))
    // Should be expanded: trigger + 3 dropdown buttons = 4 total
    expect(screen.getAllByRole('button').length).toBe(4)
    // Fire pointerdown on body
    fireEvent.pointerDown(document.body)
    // Should collapse back to just the trigger
    expect(screen.getAllByRole('button').length).toBe(1)
  })

  it('the container has role="group" and aria-label="Theme"', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('group', { name: /theme/i })).toBeInTheDocument()
  })

  it('active button has class "theme-btn--active"', async () => {
    const user = userEvent.setup()
    const { container } = render(<ThemeToggle />)
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button', { name: /dark/i }))
    // Expand again to check the active state
    await user.click(screen.getByRole('button'))
    // Inside the dropdown, the dark button should be active; light should not
    const dropdown = container.querySelector('.theme-toggle__dropdown')!
    const darkBtn = Array.from(dropdown.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label')?.match(/dark/i)
    )
    const lightBtn = Array.from(dropdown.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label')?.match(/light/i)
    )
    expect(darkBtn).toHaveClass('theme-btn--active')
    expect(lightBtn).not.toHaveClass('theme-btn--active')
  })

  it('clicking "Light" persists "light" in localStorage', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button', { name: /light/i }))
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
