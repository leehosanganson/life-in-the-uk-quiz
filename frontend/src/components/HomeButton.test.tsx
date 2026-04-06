import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HomeButton } from './HomeButton'

describe('HomeButton', () => {
  it('renders the button by default', () => {
    render(<HomeButton onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /go to home screen/i })).toBeInTheDocument()
  })

  it('renders the button when isHidden is false', () => {
    render(<HomeButton onClick={vi.fn()} isHidden={false} />)
    expect(screen.getByRole('button', { name: /go to home screen/i })).toBeInTheDocument()
  })

  it('does not render when isHidden is true', () => {
    render(<HomeButton onClick={vi.fn()} isHidden={true} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('applies home-btn--noop class when isNoOp is true', () => {
    render(<HomeButton onClick={vi.fn()} isNoOp={true} />)
    expect(screen.getByRole('button', { name: /go to home screen/i })).toHaveClass('home-btn--noop')
  })

  it('does not apply home-btn--noop class when isNoOp is false or omitted', () => {
    render(<HomeButton onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /go to home screen/i })).not.toHaveClass(
      'home-btn--noop'
    )
  })
})
