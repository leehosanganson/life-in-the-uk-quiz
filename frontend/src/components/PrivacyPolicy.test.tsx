import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { PrivacyPolicy } from './PrivacyPolicy'

describe('PrivacyPolicy', () => {
  it('renders a heading containing "Privacy"', () => {
    render(<PrivacyPolicy onBack={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /^privacy policy$/i })).toBeInTheDocument()
  })

  it('mentions anonymous aggregate data collection', () => {
    render(<PrivacyPolicy onBack={vi.fn()} />)
    expect(screen.getByText(/anonymous.*aggregate/i)).toBeInTheDocument()
  })

  it('discloses Google Fonts loading from fonts.googleapis.com', () => {
    render(<PrivacyPolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/fonts\.googleapis\.com/i)[0]).toBeInTheDocument()
  })

  it('mentions UK GDPR', () => {
    render(<PrivacyPolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/uk gdpr/i)[0]).toBeInTheDocument()
  })

  it('mentions the ICO', () => {
    render(<PrivacyPolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/ico/i)[0]).toBeInTheDocument()
  })

  it('mentions localStorage theme preference', () => {
    render(<PrivacyPolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/theme/i)[0]).toBeInTheDocument()
  })

  it('mentions MIT License in the open source section', () => {
    render(<PrivacyPolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/MIT License/i)[0]).toBeInTheDocument()
  })

  it('mentions open source in the open source section', () => {
    render(<PrivacyPolicy onBack={vi.fn()} />)
    expect(screen.getAllByText(/open source/i)[0]).toBeInTheDocument()
  })
})
