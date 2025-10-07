/**
 * TypeScript declarations for AMP (Accelerated Mobile Pages) components
 */

declare namespace JSX {
  interface IntrinsicElements {
    'amp-auto-ads': {
      type: string
      'data-ad-client': string
    }
    'amp-img': {
      src: string
      width: number | string
      height: number | string
      layout?: 'responsive' | 'fixed' | 'intrinsic' | 'fill'
      alt?: string
    }
    'amp-video': {
      src: string
      width: number | string
      height: number | string
      layout?: 'responsive' | 'fixed' | 'intrinsic' | 'fill'
      poster?: string
      autoplay?: boolean
      loop?: boolean
      controls?: boolean
    }
  }
}
