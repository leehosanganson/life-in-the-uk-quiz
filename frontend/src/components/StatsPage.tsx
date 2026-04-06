import { useState } from 'react'
import { useStats } from '../hooks/useStats'

interface StatsPageProps {
  onBack: () => void
}

export function StatsPage(_: StatsPageProps) {
  const { hardestRows, easiestRows, isLoading, error, totalTracked } = useStats()
  const [activeTab, setActiveTab] = useState<'hardest' | 'easiest'>('hardest')

  const displayedRows = activeTab === 'hardest' ? hardestRows : easiestRows

  const rowsWithAccuracy = displayedRows.filter((r) => r.accuracy !== null)
  const avgAccuracy =
    rowsWithAccuracy.length > 0
      ? Math.round(
          rowsWithAccuracy.reduce((sum, r) => sum + (r.accuracy ?? 0), 0) / rowsWithAccuracy.length
        )
      : null

  return (
    <div className="stats-screen">
      <div className="stats-header">
        <div className="stats-header__title-row">
          <h2>Question Stats</h2>
        </div>
        <div className="stats-header__summary">
          <span className="stats-summary-item">
            <span className="stats-summary-value">{totalTracked}</span> questions tracked
          </span>
          <span className="stats-summary-divider" aria-hidden="true">
            ·
          </span>
          <span className="stats-summary-item">
            avg. accuracy{' '}
            <span className="stats-summary-value">
              {avgAccuracy !== null ? `${avgAccuracy}%` : '—'}
            </span>
          </span>
        </div>
      </div>
      <div className="stats-tabs">
        <button
          className={`stats-tab${activeTab === 'hardest' ? ' stats-tab--active' : ''}`}
          onClick={() => setActiveTab('hardest')}
        >
          Top 50 Hardest
        </button>
        <button
          className={`stats-tab${activeTab === 'easiest' ? ' stats-tab--active' : ''}`}
          onClick={() => setActiveTab('easiest')}
        >
          Top 50 Easiest
        </button>
      </div>
      {isLoading && (
        <div className="stats-loading">
          <p className="stats-loading__text sr-only">Loading stats…</p>
          <div className="stats-skeleton" aria-hidden="true">
            <div className="stats-skeleton__item" />
            <div className="stats-skeleton__item" />
            <div className="stats-skeleton__item" />
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {!isLoading &&
        !error &&
        (displayedRows.length === 0 ? (
          <div className="stats-empty">
            <div className="stats-empty__icon">📊</div>
            <p>No data available yet. Complete some quizzes to see stats!</p>
          </div>
        ) : (
          <div className="stats-list-container">
            <ol className="stats-list">
              {displayedRows.map((row, index) => {
                const accuracyClass =
                  row.accuracy === null
                    ? ''
                    : row.accuracy >= 75
                      ? ' high-accuracy'
                      : ' low-accuracy'
                return (
                  <li key={row.id} className={`stats-item${accuracyClass}`}>
                    <div className="stats-item__rank">{String(index + 1).padStart(2, '0')}</div>
                    <div className="stats-item__body">
                      <span className="category">{row.category}</span>
                      <p className="question-text">{row.text}</p>
                    </div>
                    <div className="stats-item__right">
                      <span className="stats-accuracy">
                        {row.accuracy !== null ? `${row.accuracy}%` : 'N/A'}
                      </span>
                      <span aria-hidden="true" className="stats-meta-sep">
                        ·
                      </span>
                      <span className="stats-attempts">
                        {row.accuracy !== null
                          ? `${row.correctCount} / ${row.totalAttempts} attempts`
                          : 'No attempts yet'}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
    </div>
  )
}
