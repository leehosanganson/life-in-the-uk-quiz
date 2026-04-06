import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { CookiePolicy } from './CookiePolicy'

describe('CookiePolicy', () => {
  it('renders a heading containing "Cookie"', () => {
    render(<CookiePolicy onBack={vi.fn()} />)
    // Use the main heading level — the page title is the first h2
    expect(screen.getAllByRole('heading', { name: /cookie/i })[0]).toBeInTheDocument()
  })

  it('explicitly states the website does not use cookies', () => {
    render(<CookiePolicy onBack={vi.fn()} />)
    // The text is split across inline elements, search the container paragraph text
    expect(screen.getByText(/not set any first-party cookies/i)).toBeInTheDocument()
  })

  it('discloses Google Fonts from fonts.googleapis.com', () => {
    render(<CookiePolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/fonts\.googleapis\.com/i)[0]).toBeInTheDocument()
  })

  it('mentions ICO reference', () => {
    render(<CookiePolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/ico/i)[0]).toBeInTheDocument()
  })

  it('mentions localStorage theme preference key', () => {
    render(<CookiePolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/theme/i)[0]).toBeInTheDocument()
  })

  it('provides instructions for clearing localStorage', () => {
    render(<CookiePolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/clear.*localstorage/i)[0]).toBeInTheDocument()
  })
})
