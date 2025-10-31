import type { AppProps } from 'next/app'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ErrorBoundary from '@/components/ErrorBoundary'
import CookieConsent from '@/components/CookieConsent'
import '@/styles/globals.css'
import '@/styles/admin.css'

// Only load analytics in production
const isProduction = process.env.NODE_ENV === 'production'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      {/* Google Tag Manager Script - Production Only */}
      {isProduction && (
        <>
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-KTHWNW45');
              `,
            }}
          />
        </>
      )}

      <Component {...pageProps} />

      {/* Only show in production, never on localhost */}
      {isProduction && (
        <>
          <CookieConsent />
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </ErrorBoundary>
  )
}