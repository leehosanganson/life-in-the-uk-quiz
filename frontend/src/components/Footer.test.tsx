import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  const defaultProps = {
    onPrivacy: vi.fn(),
    onTerms: vi.fn(),
    onCookies: vi.fn(),
    onDisclaimer: vi.fn(),
  }

  it('renders all four link buttons', () => {
    render(<Footer {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Terms of Service' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cookie Policy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disclaimer' })).toBeInTheDocument()
  })

  it('clicking "Privacy Policy" calls onPrivacy', async () => {
    const onPrivacy = vi.fn()
    const user = userEvent.setup()
    render(<Footer {...defaultProps} onPrivacy={onPrivacy} />)
    await user.click(screen.getByRole('button', { name: 'Privacy Policy' }))
    expect(onPrivacy).toHaveBeenCalledOnce()
  })

  it('clicking "Terms of Service" calls onTerms', async () => {
    const onTerms = vi.fn()
    const user = userEvent.setup()
    render(<Footer {...defaultProps} onTerms={onTerms} />)
    await user.click(screen.getByRole('button', { name: 'Terms of Service' }))
    expect(onTerms).toHaveBeenCalledOnce()
  })

  it('clicking "Cookie Policy" calls onCookies', async () => {
    const onCookies = vi.fn()
    const user = userEvent.setup()
    render(<Footer {...defaultProps} onCookies={onCookies} />)
    await user.click(screen.getByRole('button', { name: 'Cookie Policy' }))
    expect(onCookies).toHaveBeenCalledOnce()
  })

  it('clicking "Disclaimer" calls onDisclaimer', async () => {
    const onDisclaimer = vi.fn()
    const user = userEvent.setup()
    render(<Footer {...defaultProps} onDisclaimer={onDisclaimer} />)
    await user.click(screen.getByRole('button', { name: 'Disclaimer' }))
    expect(onDisclaimer).toHaveBeenCalledOnce()
  })
})
