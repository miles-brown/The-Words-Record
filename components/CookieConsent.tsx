import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [showModal, setShowModal] = useState(false)
  const [isEuUser, setIsEuUser] = useState(false)
  const [mounted, setMounted] = useState(false)

  // First mount effect - client-side only
  useEffect(() => {
    setMounted(true)
  }, [])

  // Second effect - runs after mount
  useEffect(() => {
    if (!mounted) return

    // Check if user already consented
    const hasConsented = localStorage.getItem('cookie-consent')
    if (hasConsented === 'true') {
      return
    }

    // Detect if user is from EU/UK using timezone and language hints
    const detectEuUser = () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const language = navigator.language.toLowerCase()

      // EU/UK timezones
      const euTimezones = [
        'Europe/London', 'Europe/Dublin', 'Europe/Paris', 'Europe/Berlin',
        'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels',
        'Europe/Vienna', 'Europe/Warsaw', 'Europe/Prague', 'Europe/Budapest',
        'Europe/Athens', 'Europe/Stockholm', 'Europe/Copenhagen', 'Europe/Helsinki',
        'Europe/Lisbon', 'Europe/Bucharest', 'Europe/Sofia', 'Europe/Zagreb',
        'Europe/Luxembourg', 'Europe/Malta', 'Europe/Nicosia', 'Europe/Vilnius',
        'Europe/Riga', 'Europe/Tallinn', 'Europe/Ljubljana', 'Europe/Bratislava'
      ]

      // Check if timezone matches EU/UK
      const isEuTimezone = euTimezones.some(tz => timezone.includes(tz))

      // Check if language is from EU/UK countries
      const euLanguages = ['en-gb', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'cs', 'el', 'sv', 'da', 'fi', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga']
      const isEuLanguage = euLanguages.some(lang => language.startsWith(lang))

      return isEuTimezone || isEuLanguage
    }

    const isEu = detectEuUser()
    setIsEuUser(isEu)

    if (isEu) {
      setShowModal(true)
    }
  }, [mounted])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true')
    setShowModal(false)
  }

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted || !showModal || !isEuUser) {
    return null
  }

  return (
    <>
      <div className="cookie-overlay" onClick={(e) => e.preventDefault()}>
        <div className="cookie-modal" onClick={(e) => e.stopPropagation()}>
          <div className="cookie-content">
            <h2>🍪 Oh Great, Another Cookie Banner</h2>
            <div className="cookie-text">
              <p>
                <strong>Dear Valued European/British Visitor,</strong>
              </p>
              <p>
                Thanks to the brilliant minds who wrote GDPR (presumably while eating biscuits,
                not cookies), I'm legally obligated to interrupt your peaceful browsing experience
                with this delightful pop-up that nobody asked for but everyone must endure.
              </p>
              <p>
                Here's the deal: This website uses <strong>Google Analytics</strong>, <strong>Google AdSense</strong>,
                and <strong>Vercel Analytics</strong>. These magical tools help me understand thrilling insights like
                "someone from Berlin clicked on a thing" and "people actually read the About page (shocking!)."
              </p>
              <p>
                All this data gets used to make the site less rubbish, keep the content mildly interesting,
                and figure out which pages you lot actually care about. Revolutionary stuff, really.
              </p>
              <p className="cookie-notice">
                <strong>⚠️ Important Notice:</strong> If you don't click that big shiny button below,
                you'll be stuck staring at this message forever. Yes, I'm holding your access to cat videos
                (or whatever brought you here) hostage until you acknowledge that cookies exist.
              </p>
              <p>
                No, you can't decline. No, you can't customize. No, you can't negotiate.
                This is a cookie wall, not a cookie democracy. 🧱🍪
              </p>
              <p className="cookie-small">
                (If you're really that bothered by cookies, you probably shouldn't be on the internet.
                Just saying. Maybe try a library? Those still exist, right?)
              </p>
            </div>
            <button className="cookie-accept" onClick={handleAccept}>
              Fine, I Accept Your Cookie Tyranny →
            </button>
            <p className="cookie-footer">
              By clicking this button, you acknowledge that bureaucracy has won,
              and you just want to see the website. We get it.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cookie-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          backdrop-filter: blur(8px);
        }

        .cookie-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 20px;
          padding: 3rem;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          border: 2px solid #ffd700;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .cookie-content h2 {
          color: #ffd700;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: 700;
        }

        .cookie-text {
          color: #e0e0e0;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        .cookie-text p {
          margin-bottom: 1.25rem;
        }

        .cookie-text strong {
          color: #ffd700;
          font-weight: 600;
        }

        .cookie-notice {
          background: rgba(255, 215, 0, 0.1);
          border-left: 4px solid #ffd700;
          padding: 1rem;
          border-radius: 8px;
          margin: 1.5rem 0;
        }

        .cookie-small {
          font-size: 0.9rem;
          color: #999;
          font-style: italic;
        }

        .cookie-accept {
          width: 100%;
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #1a1a2e;
          border: none;
          padding: 1.25rem 2rem;
          font-size: 1.2rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 2rem;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
        }

        .cookie-accept:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(255, 215, 0, 0.5);
          background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
        }

        .cookie-accept:active {
          transform: translateY(0);
        }

        .cookie-footer {
          text-align: center;
          font-size: 0.85rem;
          color: #666;
          margin-top: 1rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .cookie-modal {
            padding: 2rem;
            margin: 1rem;
            max-width: 95%;
          }

          .cookie-content h2 {
            font-size: 1.5rem;
          }

          .cookie-text {
            font-size: 0.95rem;
          }

          .cookie-accept {
            font-size: 1rem;
            padding: 1rem;
          }
        }
      `}</style>
    </>
  )
}
