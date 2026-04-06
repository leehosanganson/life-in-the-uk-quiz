import { appConfig } from '../config/appConfig'

interface DisclaimerProps {
  onBack: () => void
}

export function Disclaimer(_: DisclaimerProps) {
  return (
    <div className="stats-screen legal-page">
      <h2>Disclaimer</h2>

      <p>
        <strong>Last updated:</strong> {appConfig.policyUpdateDate}
      </p>

      <h2>1. Unofficial Nature</h2>
      <p>
        This website is an <strong>unofficial, independent study aid</strong>. It is{' '}
        <strong>not</strong> affiliated with, endorsed by, approved by, or associated with:
      </p>
      <ul>
        <li>The UK Home Office</li>
        <li>UK Visas and Immigration (UKVI)</li>
        <li>Any other UK government body or agency</li>
        <li>The official Life in the United Kingdom test provider</li>
      </ul>
      <p>
        Any reference to official sources is for informational purposes only and does not imply any
        official relationship or endorsement.
      </p>

      <h2>2. Accuracy of Content</h2>
      <p>
        The quiz questions and answers are based on the publicly available Life in the United
        Kingdom study guide (&ldquo;Life in the UK: A Guide for New Residents&rdquo;). While we
        strive for accuracy:
      </p>
      <ul>
        <li>The content may contain errors, omissions, or outdated information.</li>
        <li>
          The official test content, format, and pass mark are subject to change by the Home Office
          at any time without notice to us.
        </li>
        <li>
          We make no representation that the questions on this website reflect the current official
          test.
        </li>
      </ul>

      <h2>3. No Guarantee of Exam Success</h2>
      <p>
        This website is a <strong>study aid only</strong>. Using this website does{' '}
        <strong>not</strong> guarantee that you will pass the Life in the United Kingdom test or
        meet any immigration requirement. Your performance on this website is not indicative of your
        performance on the official test.
      </p>

      <h2>4. Use Official Resources</h2>
      <p>
        You must always consult official resources for authoritative and up-to-date information:
      </p>
      <ul>
        <li>
          Official Life in the UK test information:{' '}
          <a
            href="https://www.gov.uk/life-in-the-uk-test"
            target="_blank"
            rel="noopener noreferrer"
          >
            gov.uk/life-in-the-uk-test
          </a>
        </li>
        <li>
          Official study materials are available from official government-approved publishers and
          the Home Office.
        </li>
      </ul>

      <h2>5. No Liability for Immigration Decisions</h2>
      <p>
        We accept <strong>no responsibility or liability</strong> for:
      </p>
      <ul>
        <li>Any immigration, citizenship, or visa decision made by any authority.</li>
        <li>
          Any loss, damage, or detriment arising from reliance on content provided by this website.
        </li>
        <li>
          Failure to pass the official Life in the United Kingdom test or any other examination or
          assessment.
        </li>
      </ul>
      <p>
        For immigration advice, please consult a qualified immigration adviser or solicitor
        registered with the Office of the Immigration Services Commissioner (OISC).
      </p>

      <h2>6. External Links</h2>
      <p>
        This website may contain links to external websites. We are not responsible for the content
        or privacy practices of those external sites.
      </p>

      <p>
        This website is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
        warranty of any kind, consistent with the <strong>MIT License</strong> under which it is
        released.
      </p>
    </div>
  )
}
