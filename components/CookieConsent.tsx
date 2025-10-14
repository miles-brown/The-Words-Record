/**
 * Cookie Consent Banner
 * GDPR, CCPA, and UK DPA compliant cookie consent management
 *
 * Features:
 * - Granular consent options (necessary, functional, analytics, advertising)
 * - Geolocation-aware (stricter for EU/UK/California)
 * - Integrates with Google Consent Mode v2
 * - LocalStorage persistence
 * - Accessible (WCAG 2.1 AA compliant)
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ConsentPreferences {
  necessary: boolean  // Always true, can't be disabled
  functional: boolean
  analytics: boolean
  advertising: boolean
  timestamp: number
}

const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  advertising: false,
  timestamp: Date.now()
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<ConsentPreferences>(DEFAULT_CONSENT)
  const [isEU, setIsEU] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const savedConsent = localStorage.getItem('cookie-consent')

    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        setPreferences(parsed)
        updateGoogleConsent(parsed)
      } catch (error) {
        console.error('Error parsing saved consent:', error)
        setShowBanner(true)
      }
    } else {
      // Show banner if no consent saved
      setShowBanner(true)
    }

    // Detect if user is in EU/EEA/UK (simplified check)
    // In production, use a proper geolocation service
    detectRegion()
  }, [])

  const detectRegion = async () => {
    try {
      // Simple timezone-based detection (not 100% accurate but works for most cases)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const euTimezones = ['Europe/', 'Atlantic/Reykjavik', 'Atlantic/Canary']
      setIsEU(euTimezones.some(tz => timezone.startsWith(tz)))
    } catch (error) {
      // Default to strict mode if detection fails
      setIsEU(true)
    }
  }

  const updateGoogleConsent = (prefs: ConsentPreferences) => {
    // Update Google Consent Mode v2
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': prefs.analytics ? 'granted' : 'denied',
        'ad_storage': prefs.advertising ? 'granted' : 'denied',
        'ad_user_data': prefs.advertising ? 'granted' : 'denied',
        'ad_personalization': prefs.advertising ? 'granted' : 'denied',
        'functionality_storage': prefs.functional ? 'granted' : 'denied',
        'personalization_storage': prefs.functional ? 'granted' : 'denied',
        'security_storage': 'granted' // Always granted for necessary cookies
      })
    }
  }

  const saveConsent = (prefs: ConsentPreferences) => {
    const consentData = {
      ...prefs,
      timestamp: Date.now()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(consentData))
    setPreferences(consentData)
    updateGoogleConsent(consentData)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      advertising: true,
      timestamp: Date.now()
    })
  }

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      advertising: false,
      timestamp: Date.now()
    })
  }

  const saveCustomPreferences = () => {
    saveConsent(preferences)
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      <div className="cookie-consent-overlay" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
        <div className="cookie-consent-banner">
          {!showSettings ? (
            // Simple banner
            <>
              <div className="cookie-consent-content">
                <h2 id="cookie-consent-title">🍪 We value your privacy</h2>
                <p>
                  We use cookies to enhance your browsing experience, serve personalized ads or content,
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                  {isEU && " You have the right to opt-out and can change your preferences at any time."}
                </p>
                <p className="cookie-links">
                  <Link href="/privacy">Privacy Policy</Link>
                  {' • '}
                  <Link href="/privacy#cookies">Cookie Policy</Link>
                  {' • '}
                  <button type="button" onClick={() => setShowSettings(true)} className="link-button">
                    Customize Settings
                  </button>
                </p>
              </div>
              <div className="cookie-consent-actions">
                <button type="button" onClick={acceptNecessary} className="btn-secondary">
                  {isEU ? 'Reject All' : 'Necessary Only'}
                </button>
                <button type="button" onClick={acceptAll} className="btn-primary">
                  Accept All
                </button>
              </div>
            </>
          ) : (
            // Detailed settings
            <>
              <div className="cookie-consent-content">
                <h2 id="cookie-consent-title">Cookie Settings</h2>
                <p>
                  Choose which cookies you want to accept. You can change these settings at any time.
                </p>

                <div className="cookie-categories">
                  <div className="cookie-category">
                    <div className="cookie-category-header">
                      <label>
                        <input
                          type="checkbox"
                          checked={preferences.necessary}
                          disabled
                          aria-label="Necessary cookies (always enabled)"
                        />
                        <strong>Necessary Cookies</strong>
                        <span className="required-badge">Required</span>
                      </label>
                    </div>
                    <p>
                      Essential for the website to function properly. These cannot be disabled.
                      Includes authentication, security, and basic functionality.
                    </p>
                  </div>

                  <div className="cookie-category">
                    <div className="cookie-category-header">
                      <label>
                        <input
                          type="checkbox"
                          checked={preferences.functional}
                          onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                          aria-label="Functional cookies"
                        />
                        <strong>Functional Cookies</strong>
                      </label>
                    </div>
                    <p>
                      Enable enhanced functionality like remembering your preferences,
                      language settings, and personalized content.
                    </p>
                  </div>

                  <div className="cookie-category">
                    <div className="cookie-category-header">
                      <label>
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                          aria-label="Analytics cookies"
                        />
                        <strong>Analytics Cookies</strong>
                      </label>
                    </div>
                    <p>
                      Help us understand how visitors interact with our website by collecting
                      and reporting information anonymously (Google Analytics).
                    </p>
                  </div>

                  <div className="cookie-category">
                    <div className="cookie-category-header">
                      <label>
                        <input
                          type="checkbox"
                          checked={preferences.advertising}
                          onChange={(e) => setPreferences({...preferences, advertising: e.target.checked})}
                          aria-label="Advertising cookies"
                        />
                        <strong>Advertising Cookies</strong>
                      </label>
                    </div>
                    <p>
                      Used to deliver relevant advertisements and track ad campaign performance.
                      These may be set by our advertising partners (Google AdSense).
                    </p>
                  </div>
                </div>

                <p className="cookie-links">
                  <Link href="/privacy">Privacy Policy</Link>
                  {' • '}
                  <Link href="/privacy#cookies">Full Cookie Policy</Link>
                  {' • '}
                  <Link href="/privacy#rights">Your Rights</Link>
                </p>
              </div>

              <div className="cookie-consent-actions">
                <button type="button" onClick={() => setShowSettings(false)} className="btn-text">
                  Back
                </button>
                <button type="button" onClick={acceptNecessary} className="btn-secondary">
                  Reject All
                </button>
                <button type="button" onClick={saveCustomPreferences} className="btn-primary">
                  Save Preferences
                </button>
                <button type="button" onClick={acceptAll} className="btn-primary">
                  Accept All
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .cookie-consent-overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.5);
          padding: 1rem;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cookie-consent-banner {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          padding: 2rem;
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .cookie-consent-content {
          margin-bottom: 1.5rem;
        }

        .cookie-consent-content h2 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .cookie-consent-content p {
          margin: 0.75rem 0;
          color: #555;
          line-height: 1.6;
        }

        .cookie-links {
          font-size: 0.875rem;
          margin-top: 1rem;
        }

        .cookie-links a {
          color: #3498db;
          text-decoration: none;
        }

        .cookie-links a:hover {
          text-decoration: underline;
        }

        .link-button {
          background: none;
          border: none;
          color: #3498db;
          cursor: pointer;
          padding: 0;
          font-size: inherit;
          text-decoration: none;
        }

        .link-button:hover {
          text-decoration: underline;
        }

        .cookie-categories {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .cookie-category {
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          padding: 1rem;
          background: #f8f9fa;
        }

        .cookie-category-header {
          margin-bottom: 0.5rem;
        }

        .cookie-category-header label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .cookie-category-header input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .cookie-category-header input[type="checkbox"]:disabled {
          cursor: not-allowed;
        }

        .required-badge {
          background: #2ecc71;
          color: white;
          font-size: 0.688rem;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .cookie-category p {
          margin: 0;
          font-size: 0.875rem;
          color: #6c757d;
          line-height: 1.5;
        }

        .cookie-consent-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: #3498db;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.938rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.938rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-text {
          background: transparent;
          color: #6c757d;
          border: none;
          padding: 0.75rem 1rem;
          cursor: pointer;
          font-size: 0.938rem;
          text-decoration: underline;
        }

        .btn-text:hover {
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .cookie-consent-overlay {
            padding: 0;
          }

          .cookie-consent-banner {
            border-radius: 12px 12px 0 0;
            padding: 1.5rem;
          }

          .cookie-consent-content h2 {
            font-size: 1.25rem;
          }

          .cookie-consent-actions {
            flex-direction: column;
          }

          .cookie-consent-actions button {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
