import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2c3e50" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Words Record" />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />

        {/* Google Consent Mode v2 - Load BEFORE any analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}

              // Default consent to 'denied' for everything (GDPR-compliant)
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
                'security_storage': 'granted',
                'wait_for_update': 500
              });

              // EU-specific settings
              gtag('set', 'ads_data_redaction', true);
              gtag('set', 'url_passthrough', true);
            `
          }}
        />

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