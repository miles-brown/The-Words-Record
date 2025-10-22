import type { AppProps } from 'next/app'
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