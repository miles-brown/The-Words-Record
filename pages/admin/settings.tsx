import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface UserSettings {
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  mfaEnabled: boolean
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully' })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="loading">Loading settings...</div>
      </AdminLayout>
    )
  }

  if (!settings) {
    return (
      <AdminLayout title="Settings">
        <div className="error">Failed to load settings</div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Settings - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Settings">
        <div className="settings-container">
          {/* Profile Information */}
          <section className="settings-section">
            <h2>Profile Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <div className="value">{settings.username}</div>
              </div>
              <div className="info-item">
                <label>Email</label>
                <div className="value">{settings.email || 'Not set'}</div>
              </div>
              <div className="info-item">
                <label>First Name</label>
                <div className="value">{settings.firstName || 'Not set'}</div>
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <div className="value">{settings.lastName || 'Not set'}</div>
              </div>
              <div className="info-item">
                <label>Role</label>
                <div className="value">
                  <span className="role-badge">{settings.role}</span>
                </div>
              </div>
              <div className="info-item">
                <label>Two-Factor Authentication</label>
                <div className="value">
                  <span className={`status-badge ${settings.mfaEnabled ? 'enabled' : 'disabled'}`}>
                    {settings.mfaEnabled ? '✓ Enabled' : '✗ Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Change Password */}
          <section className="settings-section">
            <h2>Change Password</h2>
            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={8}
                  disabled={saving}
                />
                <small>Minimum 8 characters</small>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </section>

          {/* System Information */}
          <section className="settings-section">
            <h2>System Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Database</label>
                <div className="value">PostgreSQL (Supabase)</div>
              </div>
              <div className="info-item">
                <label>Environment</label>
                <div className="value">{process.env.NODE_ENV || 'development'}</div>
              </div>
            </div>
          </section>
        </div>

        <style jsx>{`
          .settings-container {
            max-width: 900px;
          }

          .settings-section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }

          .settings-section h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f1f5f9;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
          }

          .info-item label {
            display: block;
            font-size: 0.8125rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
          }

          .info-item .value {
            font-size: 1rem;
            color: #0f172a;
            font-weight: 500;
          }

          .role-badge {
            display: inline-block;
            padding: 0.375rem 0.75rem;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .status-badge {
            display: inline-block;
            padding: 0.375rem 0.75rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
          }

          .status-badge.enabled {
            background: #d1fae5;
            color: #065f46;
          }

          .status-badge.disabled {
            background: #fee2e2;
            color: #991b1b;
          }

          .message {
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-weight: 500;
          }

          .message.success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
          }

          .message.error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
          }

          .password-form {
            max-width: 500px;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            font-size: 0.9375rem;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 0.5rem;
          }

          .form-group input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1.5px solid #e5e7eb;
            border-radius: 8px;
            font-size: 0.9375rem;
            transition: all 0.2s;
          }

          .form-group input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-group input:disabled {
            background: #f9fafb;
            cursor: not-allowed;
          }

          .form-group small {
            display: block;
            margin-top: 0.375rem;
            font-size: 0.8125rem;
            color: #64748b;
          }

          .btn-primary {
            padding: 0.875rem 2rem;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .loading, .error {
            text-align: center;
            padding: 3rem;
            color: #64748b;
            font-size: 1rem;
          }

          .error {
            color: #dc2626;
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
