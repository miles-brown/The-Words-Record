import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

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

        {/* Google Tag Manager - Next.js approved implementation */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXX');
          `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}