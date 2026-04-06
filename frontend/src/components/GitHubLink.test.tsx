import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GitHubLink } from './GitHubLink'

describe('GitHubLink', () => {
  it('renders a link to the GitHub repository', () => {
    render(<GitHubLink />)
    const link = screen.getByRole('link', { name: /github/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', expect.stringContaining('github.com'))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('has a descriptive aria-label', () => {
    render(<GitHubLink />)
    expect(screen.getByLabelText(/view source code on github/i)).toBeInTheDocument()
  })

  it('renders an SVG icon', () => {
    render(<GitHubLink />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
