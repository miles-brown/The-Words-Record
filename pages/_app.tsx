import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ErrorBoundary from '@/components/ErrorBoundary'
import CookieConsent from '@/components/CookieConsent'
import '@/styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <CookieConsent />
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </ErrorBoundary>
  )
}