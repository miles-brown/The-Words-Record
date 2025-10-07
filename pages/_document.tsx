import { Html, Head, Main, NextScript } from 'next/document'
import { useAmp } from 'next/amp'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google AdSense Account Meta Tag */}
        {/* This meta tag verifies ownership for Google AdSense monetization */}
        <meta name="google-adsense-account" content="ca-pub-5418171625369886" />

        {/* Google Funding Choices - Consent Management Platform (CMP) */}
        {/* Google-certified CMP required for GDPR compliance in EEA/UK/Switzerland */}
        {/* This MUST load BEFORE AdSense to handle consent properly */}
        <script
          async
          src="https://fundingchoicesmessages.google.com/i/pub-5418171625369886?ers=1"
          nonce="FUNDING-CHOICES"
        />
        <script
          nonce="FUNDING-CHOICES"
          dangerouslySetInnerHTML={{
            __html: `(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();`
          }}
        />

        {/* Google AdSense Code Snippet */}
        {/* Loads after CMP to ensure consent is collected first */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5418171625369886"
          crossOrigin="anonymous"
        />

        {/* Other meta tags can be added here */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// Component for AMP-specific document structure
export function AmpDocument() {
  return (
    <Html lang="en" amp="">
      <Head>
        {/* Google AdSense Account Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-5418171625369886" />

        {/* AMP Auto Ads Script - Step 1 */}
        <script
          async
          custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"
        />
      </Head>
      <body>
        {/* AMP Auto Ads Code - Step 2 */}
        <amp-auto-ads
          type="adsense"
          data-ad-client="ca-pub-5418171625369886"
        />

        <Main />
        <NextScript />
      </body>
    </Html>
  )
}