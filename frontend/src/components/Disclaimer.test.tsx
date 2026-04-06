import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { Disclaimer } from './Disclaimer'

describe('Disclaimer', () => {
  it('renders a heading containing "Disclaimer"', () => {
    render(<Disclaimer onBack={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /^disclaimer$/i })).toBeInTheDocument()
  })

  it('mentions unofficial nature of the service', () => {
    render(<Disclaimer onBack={vi.fn()} />)
    expect(screen.getAllByText(/unofficial/i)[0]).toBeInTheDocument()
  })

  it('states not affiliated with the Home Office', () => {
    render(<Disclaimer onBack={vi.fn()} />)
    expect(screen.getAllByText(/home office/i)[0]).toBeInTheDocument()
  })

  it('states not affiliated with UKVI', () => {
    render(<Disclaimer onBack={vi.fn()} />)
    expect(screen.getByText(/ukvi/i)).toBeInTheDocument()
  })

  it('includes a link to the official gov.uk test page', () => {
    render(<Disclaimer onBack={vi.fn()} />)
    expect(screen.getByRole('link', { name: /gov\.uk\/life-in-the-uk-test/i })).toBeInTheDocument()
  })

  it('mentions no liability for immigration decisions', () => {
    render(<Disclaimer onBack={vi.fn()} />)
    expect(screen.getAllByText(/immigration/i)[0]).toBeInTheDocument()
  })

  it('echoes the MIT no-warranty "as is" statement', () => {
    render(<Disclaimer onBack={vi.fn()} />)
    expect(screen.getAllByText(/as is/i).length).toBeGreaterThanOrEqual(1)
  })
})
