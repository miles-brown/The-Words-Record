import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { setAuthToken } from '@/lib/authFetch'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Removed auth check from login page to prevent redirect loops
  // The user should only be able to access /admin after successful login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Submitting login request...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      console.log('Login response status:', response.status, response.ok)

      let data
      try {
        data = await response.json()
        console.log('Login response data:', data)
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError)
        setError('Invalid response from server')
        return
      }

      if (response.ok && data.token) {
        console.log('Login successful, storing token and redirecting to /admin')

        // Store token in localStorage for Authorization header
        setAuthToken(data.token)

        // Cookie is already set by the server via Set-Cookie header
        console.log('Token stored, redirecting...')

        // Use window.location instead of router.push to force a full page reload
        window.location.href = '/admin'
      } else {
        // Build detailed error message
        let errorMessage = data.error || 'Login failed'

        // Add remaining attempts info if provided
        if (typeof data.attemptsRemaining === 'number') {
          if (data.attemptsRemaining > 0) {
            errorMessage += ` (${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? '' : 's'} remaining)`
          } else {
            errorMessage = 'Account locked due to too many failed login attempts. Please try again in 30 minutes.'
          }
        }

        // Add lock expiration time if provided
        if (data.lockedUntil) {
          const lockTime = new Date(data.lockedUntil)
          const now = new Date()
          const minutesRemaining = Math.ceil((lockTime.getTime() - now.getTime()) / (1000 * 60))
          errorMessage += ` Account will be unlocked in ${minutesRemaining} minute${minutesRemaining === 1 ? '' : 's'}.`
        }

        setError(errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error: Unable to connect to the server. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <Head>
        <title>Admin Login - The Words Record</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img
              src="/images/LOGO-HEADER.png"
              alt="The Words Record"
              className="login-logo"
              style={{ height: '50px', width: 'auto', margin: '0 auto 1.5rem' }}
            />
            <h1>Admin Portal</h1>
            <p>The Words Record Administration</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading || !credentials.username || !credentials.password}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="login-footer">
            <p className="help-info">
              Need access? Contact the web team for a password reset.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background-primary, #f8f9fa);
          padding: 2rem;
          font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-card {
          background: white;
          border: 1px solid var(--border-primary, #e0e0e0);
          border-radius: 2px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 440px;
          overflow: hidden;
        }

        .login-header {
          background: white;
          padding: 2.5rem 2rem 1.5rem;
          text-align: center;
          border-bottom: 1px solid var(--border-primary, #e0e0e0);
        }

        .login-header h1 {
          margin: 0 0 0.75rem 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary, #1f1f1f);
          font-family: 'Merriweather', Georgia, serif;
          letter-spacing: -0.01em;
        }

        .login-header p {
          margin: 0;
          color: var(--text-secondary, #4a4a4a);
          font-size: 1rem;
          font-weight: 400;
        }

        .login-form {
          padding: 2rem;
          background: white;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 0.875rem 1rem;
          border-radius: 2px;
          margin-bottom: 1.75rem;
          font-size: 0.925rem;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 1.75rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.6rem;
          font-weight: 600;
          color: var(--text-primary, #1f1f1f);
          font-size: 0.925rem;
          letter-spacing: 0.025em;
          text-transform: uppercase;
        }

        .form-group input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid var(--border-primary, #e0e0e0);
          border-radius: 2px;
          font-size: 1rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          background: white;
          color: var(--text-primary, #1f1f1f);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent-primary, #4a708b);
          box-shadow: 0 0 0 3px rgba(74, 112, 139, 0.1);
        }

        .form-group input:disabled {
          background: var(--background-secondary, #f8f9fa);
          color: var(--text-secondary, #4a4a4a);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .login-button {
          width: 100%;
          background: var(--accent-primary, #4a708b);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 2px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
          overflow: hidden;
        }

        .login-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .login-button:hover::before {
          left: 100%;
        }

        .login-button:hover:not(:disabled) {
          background: var(--accent-secondary, #6a8aa5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(74, 112, 139, 0.25);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          background: var(--border-primary, #e0e0e0);
          color: var(--text-secondary, #4a4a4a);
          cursor: not-allowed;
          transform: none;
        }

        .login-footer {
          background: var(--background-secondary, #f8f9fa);
          padding: 1.75rem 2rem;
          border-top: 1px solid var(--border-primary, #e0e0e0);
        }

        .help-info {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-secondary, #4a4a4a);
          text-align: center;
          line-height: 1.6;
        }

        /* Loading state animation */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .login-button:disabled {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Logo/branding (optional) */
        .login-logo {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          display: block;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 1rem;
            background: white;
          }

          .login-card {
            box-shadow: none;
            border: none;
            border-radius: 0;
          }

          .login-header {
            padding: 2rem 1.5rem 1.5rem;
          }

          .login-form {
            padding: 1.5rem;
          }

          .login-footer {
            padding: 1.25rem 1.5rem;
          }

          .login-header h1 {
            font-size: 1.75rem;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .login-container {
            background: #1a1a1a;
          }

          .login-card {
            background: #2a2a2a;
            border-color: #3a3a3a;
          }

          .login-header {
            background: #2a2a2a;
            border-bottom-color: #3a3a3a;
          }

          .login-header h1 {
            color: #f0f0f0;
          }

          .login-header p {
            color: #b0b0b0;
          }

          .login-form {
            background: #2a2a2a;
          }

          .form-group label {
            color: #f0f0f0;
          }

          .form-group input {
            background: #1a1a1a;
            border-color: #3a3a3a;
            color: #f0f0f0;
          }

          .form-group input:focus {
            border-color: #6a8aa5;
            box-shadow: 0 0 0 3px rgba(106, 138, 165, 0.1);
          }

          .login-footer {
            background: #1a1a1a;
            border-top-color: #3a3a3a;
          }

          .help-info {
            color: #b0b0b0;
          }

          .error-message {
            background: #7f1d1d;
            border-color: #991b1b;
            color: #fca5a5;
          }
        }
      `}</style>
    </>
  )
}