import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { TermsOfService } from './TermsOfService'

describe('TermsOfService', () => {
  it('renders a heading containing "Terms"', () => {
    render(<TermsOfService onBack={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /^terms of service$/i })).toBeInTheDocument()
  })

  it('describes the service as unofficial', () => {
    render(<TermsOfService onBack={vi.fn()} />)
    expect(screen.getByText(/unofficial/i)).toBeInTheDocument()
  })

  it('mentions limitation of liability', () => {
    render(<TermsOfService onBack={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /limitation of liability/i })).toBeInTheDocument()
  })

  it('mentions governing law of England and Wales', () => {
    render(<TermsOfService onBack={vi.fn()} />)
    expect(screen.getAllByText(/england and wales/i)[0]).toBeInTheDocument()
  })

  it('mentions "as is" disclaimer of warranty', () => {
    render(<TermsOfService onBack={vi.fn()} />)
    expect(screen.getByText(/as is/i)).toBeInTheDocument()
  })

  it('mentions MIT License in the intellectual property section', () => {
    render(<TermsOfService onBack={vi.fn()} />)
    expect(screen.getAllByText(/MIT License/i)[0]).toBeInTheDocument()
  })
})
