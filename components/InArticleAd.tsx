import { useEffect } from 'react'

/**
 * In-Article Ad Unit Component
 * Displays a Google AdSense in-article ad with fluid layout
 * Only renders in production and on non-admin pages
 */
export default function InArticleAd() {
  useEffect(() => {
    // Push ad to AdSense after component mounts
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  // Only show in production
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div style={{
        padding: '2rem',
        background: '#f0f0f0',
        textAlign: 'center',
        margin: '2rem 0',
        border: '2px dashed #ccc',
        color: '#666'
      }}>
        Ad Placeholder (Development Mode)
      </div>
    )
  }

  return (
    <div className="ad-container" style={{ margin: '2rem 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-5418171625369886"
        data-ad-slot="5806775347"
      />
    </div>
  )
}
