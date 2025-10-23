import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useState } from 'react'

/**
 * AdSense script component that only loads on public-facing pages
 * Excludes admin routes to prevent ads from appearing in the admin panel
 */
export default function AdSenseScript() {
  const router = useRouter()
  const [shouldLoadAds, setShouldLoadAds] = useState(false)

  useEffect(() => {
    // Check if we're on an admin route
    const isAdminRoute = router.pathname.startsWith('/admin')
    const isProduction = process.env.NODE_ENV === 'production'

    // Only load ads on public pages in production
    setShouldLoadAds(isProduction && !isAdminRoute)
  }, [router.pathname])

  // Don't render anything if we shouldn't load ads
  if (!shouldLoadAds) {
    return null
  }

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5418171625369886"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
