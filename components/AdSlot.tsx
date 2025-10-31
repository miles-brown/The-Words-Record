import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

type AdPosition = 'top-banner' | 'left-sidebar' | 'right-sidebar' | 'mid-content' | 'footer-banner' | 'mobile-inline'

interface AdSlotProps {
  position: AdPosition
  className?: string
  lazy?: boolean
}

// Ad dimensions configuration
const AD_DIMENSIONS: Record<AdPosition, { width: number | string; height: number | string; mobileWidth?: string; mobileHeight?: string | number }> = {
  'top-banner': { width: 728, height: 90, mobileWidth: '100%', mobileHeight: '50' },
  'left-sidebar': { width: 200, height: 600 },
  'right-sidebar': { width: 200, height: 600 },
  'mid-content': { width: '100%', height: 250, mobileWidth: '100%', mobileHeight: '200' },
  'footer-banner': { width: 728, height: 90, mobileWidth: '100%', mobileHeight: '50' },
  'mobile-inline': { width: '100%', height: 250 }
}

// Google AdSense client ID from environment or default
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-2227619653341213'

export default function AdSlot({ position, className = '', lazy = true }: AdSlotProps) {
  const router = useRouter()
  const adRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(!lazy)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy || isVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.01
      }
    )

    if (adRef.current) {
      observer.observe(adRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, isVisible])

  // Initialize AdSense when component becomes visible
  useEffect(() => {
    if (!isVisible) return

    try {
      // Push ad loading to AdSense queue
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
        ;(window as any).adsbygoogle.push({})
      }
    } catch (error) {
      console.error('AdSense initialization error:', error)
    }
  }, [isVisible])

  // Don't show ads on admin pages
  if (router.pathname.startsWith('/admin')) {
    return null
  }

  // Don't render sidebar ads on mobile
  if (isMobile && (position === 'left-sidebar' || position === 'right-sidebar')) {
    return null
  }

  const dimensions = AD_DIMENSIONS[position]
  const width = isMobile && dimensions.mobileWidth ? dimensions.mobileWidth : dimensions.width
  const height = isMobile && dimensions.mobileHeight ? dimensions.mobileHeight : dimensions.height

  return (
    <div
      ref={adRef}
      className={`ad-slot ad-slot-${position} ${className}`}
      aria-label="Advertisement"
      role="complementary"
      style={{
        minHeight: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        maxWidth: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isVisible ? 'transparent' : '#f5f5f5'
      }}
    >
      {/* Ad label for transparency */}
      <span
        className="ad-label"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          fontSize: '11px',
          color: '#999',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 6px',
          borderRadius: '2px',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          zIndex: 1
        }}
      >
        Ad
      </span>

      {isVisible ? (
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            height: '100%'
          }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={getAdSlotId(position)}
          data-ad-format={position === 'mid-content' || position === 'mobile-inline' ? 'auto' : 'display'}
          data-full-width-responsive={position === 'mid-content' || position === 'mobile-inline' ? 'true' : 'false'}
        />
      ) : (
        <div
          className="ad-placeholder"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(90deg, #f5f5f5 0%, #fafafa 50%, #f5f5f5 100%)',
            color: '#ccc',
            fontSize: '12px',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          <span>Loading ad...</span>
        </div>
      )}
    </div>
  )
}

// Map positions to AdSense slot IDs (you'll need to create these in your AdSense account)
function getAdSlotId(position: AdPosition): string {
  const slotMap: Record<AdPosition, string> = {
    'top-banner': '1234567890',
    'left-sidebar': '2345678901',
    'right-sidebar': '3456789012',
    'mid-content': '4567890123',
    'footer-banner': '5678901234',
    'mobile-inline': '6789012345'
  }
  return slotMap[position] || '1234567890'
}