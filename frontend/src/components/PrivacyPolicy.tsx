import { appConfig } from '../config/appConfig'

interface PrivacyPolicyProps {
  onBack: () => void
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="stats-screen legal-page">
      <h2>Privacy Policy</h2>

      <p>
        <strong>Effective date:</strong> {appConfig.policyUpdateDate} &nbsp;|&nbsp;{' '}
        <strong>Version:</strong> 1.1
      </p>

      <h2>1. Who We Are</h2>
      <p>
        This website is operated by {appConfig.operatorName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;). For questions about this policy, contact us at{' '}
        <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.
      </p>

      <h2>2. What Data We Collect</h2>
      <p>
        We collect <strong>no personal data</strong>. Specifically:
      </p>
      <ul>
        <li>
          When you answer a quiz question, we record an <strong>anonymous, aggregate count</strong>{' '}
          of correct and incorrect attempts at the question level in a PostgreSQL database. No user
          ID, session ID, or IP address is stored alongside these counts.
        </li>
        <li>We do not collect your name, email address, or any other identifying information.</li>
        <li>We do not run any advertising or third-party analytics scripts.</li>
      </ul>

      <h2>3. Local Storage</h2>
      <p>
        We use your browser&rsquo;s <code>localStorage</code> to remember your theme preference
        under the key <code>&apos;theme&apos;</code>. This data never leaves your device and is not
        transmitted to our servers.
      </p>

      <h2>4. Third-Party Resources — Google Fonts</h2>
      <p>
        This website loads fonts (Playfair Display and DM Sans) directly from{' '}
        <strong>fonts.googleapis.com</strong> via a <code>&lt;link&gt;</code> tag in the page HTML.
        This means your browser makes a request to Google&rsquo;s servers when you visit the site.
        Google may log your IP address and other request metadata as part of serving the font files.
        Please refer to{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google&rsquo;s Privacy Policy
        </a>{' '}
        for details on how they handle this data. We do not control this processing.
      </p>

      <h2>5. Cookies</h2>
      <p>
        We do not set any cookies. See our{' '}
        <a
          href="#cookies"
          onClick={(e) => {
            e.preventDefault()
            onBack()
          }}
        >
          Cookie Policy
        </a>{' '}
        for full details.
      </p>

      <h2>6. Lawful Basis Under UK GDPR</h2>
      <p>
        As we do not process personal data, UK GDPR does not apply to our data processing
        activities. The aggregate question statistics we record contain no personal data. To the
        extent any borderline processing occurs, our lawful basis is{' '}
        <strong>legitimate interests</strong> (Article 6(1)(f) UK GDPR) in improving the quality of
        the quiz by understanding which questions users find difficult.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        Aggregate question counts are retained indefinitely as they contain no personal data. There
        is no defined deletion schedule. localStorage data for the theme preference persists until
        you clear it through your browser settings.
      </p>

      <h2>8. Your Rights Under UK GDPR</h2>
      <p>
        Because we do not hold personal data about you, most UK GDPR data subject rights are not
        applicable. For completeness, those rights are:
      </p>
      <ul>
        <li>
          <strong>Access</strong> &mdash; not applicable (no personal data held)
        </li>
        <li>
          <strong>Erasure</strong> &mdash; not applicable
        </li>
        <li>
          <strong>Rectification</strong> &mdash; not applicable
        </li>
        <li>
          <strong>Restriction of processing</strong> &mdash; not applicable
        </li>
        <li>
          <strong>Portability</strong> &mdash; not applicable
        </li>
        <li>
          <strong>Objection</strong> &mdash; not applicable
        </li>
      </ul>
      <p>
        You may clear your theme preference at any time by clearing your browser&rsquo;s
        localStorage (see our Cookie Policy for instructions).
      </p>

      <h2>9. Right to Complain to the ICO</h2>
      <p>
        If you believe we have not handled your data appropriately, you have the right to lodge a
        complaint with the Information Commissioner&rsquo;s Office (ICO), the UK&rsquo;s data
        protection supervisory authority:
      </p>
      <ul>
        <li>
          Website:{' '}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
            ico.org.uk
          </a>
        </li>
        <li>Telephone: 0303 123 1113</li>
      </ul>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The effective date at the top of this
        page will be updated accordingly. Continued use of the website constitutes acceptance of any
        revised policy.
      </p>

      <h2>11. Open Source</h2>
      <p>
        The source code for this website is open source and released under the{' '}
        <strong>MIT License</strong> (copyright &copy; 2026 {appConfig.operatorName}). The MIT
        License permits anyone to use, copy, modify, merge, publish, distribute, sublicense, and/or
        sell copies of the source code. A copy of the licence is included in the project repository.
      </p>
    </div>
  )
}
