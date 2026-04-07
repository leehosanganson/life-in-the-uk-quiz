import { Footer } from './Footer'
import { appConfig } from '../config/appConfig'

interface StartScreenProps {
  onStart: () => void
  isLoading: boolean
  error: string | null
  onViewStats: () => void
  onStartHard: () => void
  questionCount: number
  onPrivacy?: () => void
  onTerms?: () => void
  onCookies?: () => void
  onDisclaimer?: () => void
}

export function StartScreen({
  onStart,
  isLoading,
  error,
  onViewStats,
  onStartHard,
  questionCount,
  onPrivacy,
  onTerms,
  onCookies,
  onDisclaimer,
}: StartScreenProps) {
  return (
    <div className="start-screen">
      <div className="start-screen__watermark" aria-hidden="true">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 600 400"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Blue field */}
          <rect width="600" height="400" fill="#012169" />
          {/* St Andrew's Cross - white diagonals */}
          <line x1="0" y1="0" x2="600" y2="400" stroke="#FFFFFF" strokeWidth="80" />
          <line x1="600" y1="0" x2="0" y2="400" stroke="#FFFFFF" strokeWidth="80" />
          {/* St Patrick's Counter-change - red offset diagonals (NW to SE quadrants) */}
          <polygon points="0,0 40,0 300,187 300,213 0,40" fill="#C8102E" />
          <polygon points="600,0 560,0 300,187 300,213 600,40" fill="#C8102E" />
          <polygon points="0,400 0,360 300,213 300,187 40,400" fill="#C8102E" />
          <polygon points="600,400 600,360 300,213 300,187 560,400" fill="#C8102E" />
          {/* St George's Cross - white horizontal/vertical */}
          <rect x="240" y="0" width="120" height="400" fill="#FFFFFF" />
          <rect x="0" y="160" width="600" height="80" fill="#FFFFFF" />
          {/* St George's Cross - red (narrower) */}
          <rect x="260" y="0" width="80" height="400" fill="#C8102E" />
          <rect x="0" y="175" width="600" height="50" fill="#C8102E" />
        </svg>
      </div>
      <div className="start-screen__content">
        <h1>Life in the UK Quiz</h1>
        <p className="description">
          Prepare for your British citizenship test with authentic practice questions. Build
          confidence, track your weak spots, and pass first time.
        </p>
        <div className="start-screen__stats">
          <span className="start-screen__chip">
            {questionCount > 0 ? `🎯 ${questionCount} Questions` : '🎯 … Questions'}
          </span>
          <span className="start-screen__chip">📚 Multiple Categories</span>
          <span className="start-screen__chip">✅ Pass Rate: 75%</span>
        </div>
        <div className="start-screen__actions">
          <button className="primary-btn" onClick={onStart} disabled={isLoading}>
            {isLoading ? 'Loading…' : 'Random'}
          </button>
          <button className="secondary-btn" onClick={onStartHard} disabled={isLoading}>
            Hard
          </button>
          <button className="ghost-btn" onClick={onViewStats}>
            View Global Stats
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <p className="start-screen__notice">
          This quiz is a fun, unofficial alternative to help you study. For your actual test
          preparation, please use the{' '}
          <a
            href="https://www.gov.uk/life-in-the-uk-test"
            target="_blank"
            rel="noopener noreferrer"
          >
            official Life in the UK test site
          </a>
          . This project cannot replace official resources.
        </p>
        {appConfig.githubUrl && (
          <p className="start-screen__notice">
            Found a mistake? Feel free to{' '}
            <a href={`${appConfig.githubUrl}/issues/new`} target="_blank" rel="noopener noreferrer">
              submit an issue
            </a>{' '}
            on GitHub.
          </p>
        )}
      </div>
      {onPrivacy && onTerms && onCookies && onDisclaimer && (
        <Footer
          onPrivacy={onPrivacy}
          onTerms={onTerms}
          onCookies={onCookies}
          onDisclaimer={onDisclaimer}
        />
      )}
    </div>
  )
}
