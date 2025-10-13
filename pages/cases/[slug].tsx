/**
 * Redirect from old /cases/[slug] route to new /statements/[slug] route
 * Preserves backward compatibility for old URLs
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function CaseSlugRedirect() {
  const router = useRouter()
  const { slug } = router.query

  useEffect(() => {
    if (slug) {
      router.replace(`/statements/${slug}`)
    }
  }, [router, slug])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to statement...</p>
    </div>
  )
}
