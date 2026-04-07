import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// vi.mock is hoisted to the top of the module by Vitest, so it applies to ALL
// imports of '../config/appConfig' within this file, including GitHubLink.tsx.
vi.mock('../config/appConfig', () => ({
  appConfig: {
    githubUrl: 'https://github.com/example/repo',
    contactEmail: undefined,
    operatorName: undefined,
    policyUpdateDate: undefined,
  },
  copyrightYear: '2026',
}))

// Because vi.mock is hoisted and always active in this file, both tests run
// against the mocked appConfig (githubUrl = 'https://github.com/example/repo').
import { GitHubLink } from './GitHubLink'

describe('GitHubLink — when githubUrl is configured', () => {
  it('renders a link with the correct href and aria-label', () => {
    render(<GitHubLink />)

    const link = screen.getByRole('link', { name: /view source code on github/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://github.com/example/repo')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders an SVG icon inside the link', () => {
    const { container } = render(<GitHubLink />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

// For the undefined-githubUrl path, we test via vi.importActual in a separate
// inline mock. Since vi.mock is file-scoped and hoisted, we document this
// constraint: the null-render path is covered by the component's own guard
// (`if (!appConfig.githubUrl) return null`), which is verified by code review.
// A dedicated test file would be needed to test both paths without vi.mock.
describe('GitHubLink — when githubUrl is undefined', () => {
  it('renders nothing when githubUrl is undefined (covered by module mock guard)', async () => {
    // Use vi.importActual to load the real appConfig (githubUrl is undefined in tests)
    // and dynamically import GitHubLink after temporarily resetting the mock.
    vi.doMock('../config/appConfig', async () => {
      const actual =
        await vi.importActual<typeof import('../config/appConfig')>('../config/appConfig')
      return actual
    })
    // Reset module registry so the next import picks up doMock
    vi.resetModules()
    const { GitHubLink: GitHubLinkReal } = await import('./GitHubLink')
    const { container } = render(<GitHubLinkReal />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    // Restore the top-level mock for subsequent test files
    vi.doMock('../config/appConfig', () => ({
      appConfig: {
        githubUrl: 'https://github.com/example/repo',
        contactEmail: undefined,
        operatorName: undefined,
        policyUpdateDate: undefined,
      },
      copyrightYear: '2026',
    }))
    vi.resetModules()
  })
})
