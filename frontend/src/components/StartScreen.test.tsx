import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { StartScreen } from './StartScreen'

describe('StartScreen', () => {
  const defaultProps = {
    onStart: vi.fn(),
    isLoading: false,
    error: null,
    onViewStats: vi.fn(),
    onStartHard: vi.fn(),
    questionCount: 0,
  }

  it('"Random" button calls onStart', async () => {
    const onStart = vi.fn()
    render(<StartScreen {...defaultProps} onStart={onStart} />)
    await userEvent.click(screen.getByRole('button', { name: 'Random' }))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('"Hard" button calls onStartHard', async () => {
    const onStartHard = vi.fn()
    render(<StartScreen {...defaultProps} onStartHard={onStartHard} />)
    await userEvent.click(screen.getByRole('button', { name: 'Hard' }))
    expect(onStartHard).toHaveBeenCalledTimes(1)
  })

  it('"View Global Stats" button calls onViewStats', async () => {
    const onViewStats = vi.fn()
    render(<StartScreen {...defaultProps} onViewStats={onViewStats} />)
    await userEvent.click(screen.getByRole('button', { name: 'View Global Stats' }))
    expect(onViewStats).toHaveBeenCalledTimes(1)
  })

  it('Random button shows "Loading…" and is disabled when isLoading is true', () => {
    render(<StartScreen {...defaultProps} isLoading={true} />)
    const btn = screen.getByRole('button', { name: 'Loading…' })
    expect(btn).toBeDisabled()
  })

  it('renders footer link buttons when all four legal callbacks are provided', () => {
    render(
      <StartScreen
        {...defaultProps}
        onPrivacy={vi.fn()}
        onTerms={vi.fn()}
        onCookies={vi.fn()}
        onDisclaimer={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Terms of Service' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cookie Policy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disclaimer' })).toBeInTheDocument()
  })

  it('does not render footer when legal callbacks are not provided', () => {
    render(<StartScreen {...defaultProps} />)
    expect(screen.queryByRole('button', { name: 'Privacy Policy' })).not.toBeInTheDocument()
  })

  it('renders official site notice with a link to gov.uk', () => {
    render(<StartScreen {...defaultProps} />)
    const link = screen.getByRole('link', { name: 'official Life in the UK test site' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://www.gov.uk/life-in-the-uk-test')
  })

  it('renders the question count chip with the provided questionCount', () => {
    render(<StartScreen {...defaultProps} questionCount={500} />)
    expect(screen.getByText('🎯 500 Questions')).toBeInTheDocument()
  })

  it('renders the loading placeholder chip when questionCount is 0', () => {
    render(<StartScreen {...defaultProps} questionCount={0} />)
    expect(screen.getByText('🎯 … Questions')).toBeInTheDocument()
  })

  it('does not render the "submit an issue" notice when githubUrl is undefined', () => {
    render(<StartScreen {...defaultProps} />)
    expect(screen.queryByRole('link', { name: 'submit an issue' })).not.toBeInTheDocument()
  })
})
