import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { StatsPage } from './StatsPage'
import * as useStatsModule from '../hooks/useStats'

vi.mock('../hooks/useStats')

const mockUseStats = vi.mocked(useStatsModule.useStats)

describe('StatsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders loading state', () => {
    mockUseStats.mockReturnValue({
      hardestRows: [],
      easiestRows: [],
      isLoading: true,
      error: null,
      totalTracked: 0,
    })
    render(<StatsPage onBack={vi.fn()} />)
    expect(screen.getByText('Loading stats…')).toBeInTheDocument()
  })

  it('renders error message', () => {
    mockUseStats.mockReturnValue({
      hardestRows: [],
      easiestRows: [],
      isLoading: false,
      error: 'Failed to load stats',
      totalTracked: 0,
    })
    render(<StatsPage onBack={vi.fn()} />)
    expect(screen.getByText('Failed to load stats')).toBeInTheDocument()
  })

  it('renders question rows with accuracy percentage', () => {
    mockUseStats.mockReturnValue({
      hardestRows: [
        {
          id: 'q1',
          text: 'What is the capital of the UK?',
          category: 'Geography',
          totalAttempts: 10,
          correctCount: 8,
          accuracy: 80,
        },
        {
          id: 'q2',
          text: 'Who wrote Romeo and Juliet?',
          category: 'Culture',
          totalAttempts: 4,
          correctCount: 1,
          accuracy: 25,
        },
      ],
      easiestRows: [],
      isLoading: false,
      error: null,
      totalTracked: 2,
    })
    render(<StatsPage onBack={vi.fn()} />)
    expect(screen.getByText('What is the capital of the UK?')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('8 / 10 attempts')).toBeInTheDocument()
    expect(screen.getByText('Who wrote Romeo and Juliet?')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('1 / 4 attempts')).toBeInTheDocument()
  })

  it('renders "Question Stats" heading', () => {
    mockUseStats.mockReturnValue({
      hardestRows: [],
      easiestRows: [],
      isLoading: false,
      error: null,
      totalTracked: 0,
    })
    render(<StatsPage onBack={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Question Stats' })).toBeInTheDocument()
  })

  it('renders both tab buttons', () => {
    mockUseStats.mockReturnValue({
      hardestRows: [],
      easiestRows: [],
      isLoading: false,
      error: null,
      totalTracked: 0,
    })
    render(<StatsPage onBack={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Top 50 Hardest' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Top 50 Easiest' })).toBeInTheDocument()
  })

  it('defaults to "Top 50 Hardest" tab and shows hardest rows', () => {
    mockUseStats.mockReturnValue({
      hardestRows: [
        {
          id: 'q1',
          text: 'Hard question',
          category: 'History',
          totalAttempts: 5,
          correctCount: 1,
          accuracy: 20,
        },
      ],
      easiestRows: [
        {
          id: 'q2',
          text: 'Easy question',
          category: 'Culture',
          totalAttempts: 5,
          correctCount: 5,
          accuracy: 100,
        },
      ],
      isLoading: false,
      error: null,
      totalTracked: 2,
    })
    render(<StatsPage onBack={vi.fn()} />)
    expect(screen.getByText('Hard question')).toBeInTheDocument()
    expect(screen.queryByText('Easy question')).not.toBeInTheDocument()
  })

  it('switches to "Top 50 Easiest" tab on click', async () => {
    mockUseStats.mockReturnValue({
      hardestRows: [
        {
          id: 'q1',
          text: 'Hard question',
          category: 'History',
          totalAttempts: 5,
          correctCount: 1,
          accuracy: 20,
        },
      ],
      easiestRows: [
        {
          id: 'q2',
          text: 'Easy question',
          category: 'Culture',
          totalAttempts: 5,
          correctCount: 5,
          accuracy: 100,
        },
      ],
      isLoading: false,
      error: null,
      totalTracked: 2,
    })
    render(<StatsPage onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Top 50 Easiest' }))
    expect(screen.getByText('Easy question')).toBeInTheDocument()
    expect(screen.queryByText('Hard question')).not.toBeInTheDocument()
  })

  it('displays totalTracked from hook', () => {
    mockUseStats.mockReturnValue({
      hardestRows: [],
      easiestRows: [],
      isLoading: false,
      error: null,
      totalTracked: 99,
    })
    render(<StatsPage onBack={vi.fn()} />)
    expect(screen.getByText('99')).toBeInTheDocument()
  })
})
