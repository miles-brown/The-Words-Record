// @ts-nocheck
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    checkExistingAuth()
  }, [])

  const checkExistingAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        router.push('/admin')
      }
    } catch (error) {
      // Not logged in, stay on login page
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
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
        <title>Admin Login - Who Said What</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Admin Login</h1>
            <p>Who Said What Administration</p>
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
            <p className="demo-info">
              <strong>Demo Credentials:</strong><br />
              Username: admin<br />
              Password: admin123
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .login-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
          overflow: hidden;
        }

        .login-header {
          background: #2c3e50;
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .login-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 600;
        }

        .login-header p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.95rem;
        }

        .login-form {
          padding: 2rem;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e6ed;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-group input:disabled {
          background: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .login-button {
          width: 100%;
          background: #3498db;
          color: white;
          border: none;
          padding: 0.875rem;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .login-button:hover:not(:disabled) {
          background: #2980b9;
        }

        .login-button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .login-footer {
          background: #f8f9fa;
          padding: 1.5rem 2rem;
          border-top: 1px solid #e0e6ed;
        }

        .demo-info {
          margin: 0;
          font-size: 0.875rem;
          color: #6c757d;
          text-align: center;
          line-height: 1.5;
        }

        .demo-info strong {
          color: #2c3e50;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 1rem;
          }

          .login-form {
            padding: 1.5rem;
          }

          .login-footer {
            padding: 1rem 1.5rem;
          }
        }
      `}</style>
    </>
  )
}