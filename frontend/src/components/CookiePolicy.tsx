import { appConfig } from '../config/appConfig'

interface CookiePolicyProps {
  onBack: () => void
}

export function CookiePolicy(_: CookiePolicyProps) {
  return (
    <div className="stats-screen legal-page">
      <h2>Cookie Policy</h2>

      <p>
        <strong>Last updated:</strong> {appConfig.policyUpdateDate}
      </p>

      <h2>1. Do We Use Cookies?</h2>
      <p>
        <strong>No.</strong> This website does <strong>not</strong> use cookies. We do not set any
        first-party cookies on your device, and we do not use advertising, analytics, or tracking
        cookies of any kind.
      </p>

      <h2>2. Local Storage</h2>
      <p>
        We use your browser&rsquo;s <strong>localStorage</strong> (not cookies) to store a single
        item: your theme preference, stored under the key <code>&apos;theme&apos;</code>. This data:
      </p>
      <ul>
        <li>Remains entirely on your device and is never transmitted to our servers.</li>
        <li>Is not shared with any third party.</li>
        <li>Does not track you or your browsing activity.</li>
        <li>
          Persists between browser sessions until you clear it (see &ldquo;How to Clear
          localStorage&rdquo; below).
        </li>
      </ul>

      <h2>3. Third-Party Requests — Google Fonts</h2>
      <p>
        This website loads web fonts (Playfair Display and DM Sans) from{' '}
        <strong>fonts.googleapis.com</strong>, a service operated by Google LLC. When your browser
        requests these fonts, Google may:
      </p>
      <ul>
        <li>Set cookies on your device according to Google&rsquo;s own cookie policy.</li>
        <li>Log your IP address and other HTTP request metadata.</li>
      </ul>
      <p>
        We do not control this behaviour. Please review{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google&rsquo;s Privacy Policy
        </a>{' '}
        and{' '}
        <a
          href="https://policies.google.com/technologies/cookies"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google&rsquo;s Cookie Policy
        </a>{' '}
        for full details.
      </p>

      <h2>4. ICO Reference</h2>
      <p>
        For more information about cookies and your rights, visit the Information
        Commissioner&rsquo;s Office (ICO) website:{' '}
        <a
          href="https://ico.org.uk/for-the-public/online/cookies/"
          target="_blank"
          rel="noopener noreferrer"
        >
          ico.org.uk/for-the-public/online/cookies
        </a>
        .
      </p>

      <h2>5. How to Clear localStorage</h2>
      <p>
        You can remove the theme preference stored in localStorage at any time through your
        browser&rsquo;s developer tools or settings:
      </p>
      <ul>
        <li>
          <strong>Chrome / Edge:</strong> Open DevTools (F12) &rarr; Application &rarr; Storage
          &rarr; Local Storage &rarr; select this site &rarr; delete the <code>theme</code> key, or
          click &ldquo;Clear All&rdquo;.
        </li>
        <li>
          <strong>Firefox:</strong> Open DevTools (F12) &rarr; Storage &rarr; Local Storage &rarr;
          select this site &rarr; delete the <code>theme</code> entry.
        </li>
        <li>
          <strong>Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data &rarr;
          search for this site &rarr; Remove.
        </li>
      </ul>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. The &ldquo;Last updated&rdquo; date
        above will reflect any changes. Continued use of the website following any update
        constitutes acceptance of the revised policy.
      </p>
    </div>
  )
}
