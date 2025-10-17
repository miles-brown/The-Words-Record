/**
 * Google Tag Manager Helper
 *
 * Utility functions for interacting with Google Tag Manager's dataLayer.
 * Allows components to push custom events and data to GTM for tracking.
 *
 * Container ID: GTM-KTHWNW45
 */

// Extend the Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>
  }
}

/**
 * Push a custom event to the GTM dataLayer
 *
 * @param event - The event name (e.g., 'source_edited', 'user_login')
 * @param data - Optional additional data to send with the event
 *
 * @example
 * ```ts
 * pushToDataLayer('source_edited', { sourceId: 123, sourceName: 'Example' })
 * ```
 *
 * @example
 * ```ts
 * pushToDataLayer('page_view', { pageType: 'admin', section: 'sources' })
 * ```
 */
export const pushToDataLayer = (event: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event, ...data })
  }
}

/**
 * Push user properties to the dataLayer
 * Useful for tracking user attributes without triggering an event
 *
 * @param properties - User properties to track
 *
 * @example
 * ```ts
 * setUserProperties({ userId: '123', userRole: 'admin' })
 * ```
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(properties)
  }
}

/**
 * Track page views manually (useful for SPA navigation)
 *
 * @param pagePath - The page path (e.g., '/admin/sources')
 * @param pageTitle - Optional page title
 *
 * @example
 * ```ts
 * trackPageView('/admin/sources', 'Sources Management')
 * ```
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  pushToDataLayer('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  })
}
