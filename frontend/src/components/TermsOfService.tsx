import { appConfig } from '../config/appConfig'

interface TermsOfServiceProps {
  onBack: () => void
}

export function TermsOfService(_: TermsOfServiceProps) {
  return (
    <div className="stats-screen legal-page">
      <h2>Terms of Service</h2>

      <p>
        <strong>Last updated:</strong> {appConfig.policyUpdateDate}
      </p>
      <p>
        Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using this website
        (the &ldquo;Service&rdquo;) operated by {appConfig.operatorName} (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;). By accessing or using the Service you agree to be
        bound by these Terms.
      </p>

      <h2>1. Nature of the Service</h2>
      <p>
        The Service is a <strong>free, unofficial study aid</strong> designed to help individuals
        prepare for the Life in the United Kingdom citizenship test. It is not affiliated with, nor
        endorsed by, any government body, examination authority, or official test provider. Use of
        this Service does <strong>not</strong> guarantee success in any examination.
      </p>

      <h2>2. Permitted Use</h2>
      <p>
        The Service is provided for <strong>personal, non-commercial study purposes only</strong>.
        You may not:
      </p>
      <ul>
        <li>
          Use the Service infrastructure or hosted instance to operate a commercial service or
          resell access to it.
        </li>
        <li>Use automated tools (bots, scrapers, crawlers) to extract content from the Service.</li>
        <li>
          Attempt to interfere with, disrupt, or gain unauthorised access to the Service or its
          underlying infrastructure.
        </li>
      </ul>

      <h2>3. Intellectual Property</h2>
      <p>
        The quiz questions are based on publicly available information from the official Life in the
        United Kingdom study guide published by the Home Office. We do not claim copyright in the
        underlying factual content. The source code for this Service is copyright &copy; 2026{' '}
        {appConfig.operatorName} and is released under the MIT License. You are free to use, copy,
        modify, merge, publish, distribute, sublicense, and/or sell copies of the source code in
        accordance with the terms of the MIT License, a copy of which is available in the project
        repository.
      </p>

      <h2>4. Disclaimer of Warranty</h2>
      <p>
        The Service is provided <strong>&ldquo;as is&rdquo;</strong> and{' '}
        <strong>&ldquo;as available&rdquo;</strong> without warranty of any kind, express or
        implied, including but not limited to warranties of merchantability, fitness for a
        particular purpose, accuracy, or non-infringement. We do not warrant that the Service will
        be uninterrupted, error-free, or free of viruses or other harmful components.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by applicable law, {appConfig.operatorName} shall not be
        liable for any direct, indirect, incidental, special, consequential, or punitive damages,
        including but not limited to:
      </p>
      <ul>
        <li>Failure to pass the Life in the United Kingdom test or any other examination.</li>
        <li>Any immigration or citizenship decision made by any authority.</li>
        <li>Loss of data, loss of revenue, or any other pecuniary loss.</li>
      </ul>
      <p>Your use of the Service is entirely at your own risk.</p>

      <h2>6. Availability</h2>
      <p>
        We reserve the right to modify, suspend, or discontinue the Service (or any part of it) at
        any time and without notice. We shall not be liable to you or any third party for any such
        modification, suspension, or discontinuation.
      </p>

      <h2>7. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the{' '}
        <strong>laws of England and Wales</strong>. Any disputes arising under these Terms shall be
        subject to the exclusive jurisdiction of the courts of England and Wales.
      </p>

      <h2>8. Changes to These Terms</h2>
      <p>
        We may revise these Terms at any time by updating this page. The &ldquo;Last updated&rdquo;
        date at the top will reflect the most recent revision. Your continued use of the Service
        after any changes constitutes acceptance of the revised Terms.
      </p>

      <h2>9. Contact</h2>
      <p>
        If you have any questions about these Terms, please contact us at{' '}
        <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.
      </p>
    </div>
  )
}
