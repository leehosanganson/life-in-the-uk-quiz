import { appConfig, copyrightYear } from '../config/appConfig'

interface FooterProps {
  onPrivacy: () => void
  onTerms: () => void
  onCookies: () => void
  onDisclaimer: () => void
}

export function Footer({ onPrivacy, onTerms, onCookies, onDisclaimer }: FooterProps) {
  return (
    <footer className="footer">
      <nav className="footer__links" aria-label="Legal">
        <button className="footer__link" onClick={onPrivacy}>
          Privacy Policy
        </button>
        <button className="footer__link" onClick={onTerms}>
          Terms of Service
        </button>
        <button className="footer__link" onClick={onCookies}>
          Cookie Policy
        </button>
        <button className="footer__link" onClick={onDisclaimer}>
          Disclaimer
        </button>
      </nav>
      <p className="footer__copy">
        &copy; {copyrightYear} {appConfig.operatorName}
      </p>
      {appConfig.appVersion && <p className="footer__version">{appConfig.appVersion}</p>}
    </footer>
  )
}
