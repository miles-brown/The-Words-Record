/**
 * Redirect from old /cases route to new /statements route
 * Preserves backward compatibility for old URLs
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function CasesRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/statements')
  }, [router])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to statements...</p>
    </div>
  )
}
