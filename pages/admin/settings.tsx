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
        <div className="flex items-center justify-center py-20">
          <div className="admin-spinner admin-spinner-lg"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!settings) {
    return (
      <AdminLayout title="Settings">
        <div className="admin-error-message">Failed to load settings</div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Settings - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Settings">
        <div className="admin-section">
          <div className="admin-header">
            <h1 className="admin-title">Settings</h1>
            <p className="admin-subtitle">Manage your account preferences and security settings</p>
          </div>

          {/* Profile Information */}
          <div className="admin-card mb-8">
            <h2 className="admin-card-title mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="admin-info-item">
                <label className="admin-label">Username</label>
                <div className="admin-info-value">{settings.username}</div>
              </div>
              <div className="admin-info-item">
                <label className="admin-label">Email</label>
                <div className="admin-info-value">{settings.email || 'Not set'}</div>
              </div>
              <div className="admin-info-item">
                <label className="admin-label">First Name</label>
                <div className="admin-info-value">{settings.firstName || 'Not set'}</div>
              </div>
              <div className="admin-info-item">
                <label className="admin-label">Last Name</label>
                <div className="admin-info-value">{settings.lastName || 'Not set'}</div>
              </div>
              <div className="admin-info-item">
                <label className="admin-label">Role</label>
                <div className="admin-info-value">
                  <span className="admin-badge admin-badge-primary">{settings.role}</span>
                </div>
              </div>
              <div className="admin-info-item">
                <label className="admin-label">Two-Factor Authentication</label>
                <div className="admin-info-value">
                  <span className={`admin-badge ${settings.mfaEnabled ? 'admin-badge-success' : 'admin-badge-secondary'}`}>
                    {settings.mfaEnabled ? '✓ Enabled' : '✗ Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="admin-card mb-8">
            <h2 className="admin-card-title mb-6">Change Password</h2>
            {message && (
              <div className={`admin-alert ${message.type === 'success' ? 'admin-alert-success' : 'admin-alert-error'} mb-6`}>
                {message.text}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="max-w-xl">
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="admin-label">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    disabled={saving}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="admin-label">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={8}
                    disabled={saving}
                    className="admin-input"
                  />
                  <p className="admin-help-text mt-2">Minimum 8 characters</p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="admin-label">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    disabled={saving}
                    className="admin-input"
                  />
                </div>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* System Information */}
          <div className="admin-card">
            <h2 className="admin-card-title mb-6">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="admin-info-item">
                <label className="admin-label">Database</label>
                <div className="admin-info-value">PostgreSQL (Supabase)</div>
              </div>
              <div className="admin-info-item">
                <label className="admin-label">Environment</label>
                <div className="admin-info-value">
                  <span className={`admin-badge ${process.env.NODE_ENV === 'production' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                    {process.env.NODE_ENV || 'development'}
                  </span>
                </div>
              </div>
              <div className="admin-info-item">
                <label className="admin-label">Version</label>
                <div className="admin-info-value">1.0.0</div>
              </div>
              <div className="admin-info-item">
                <label className="admin-label">Last Deploy</label>
                <div className="admin-info-value">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}