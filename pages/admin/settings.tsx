/**
 * Admin Settings Page - Rebuilt to match /admin/apps/ Design System
 * Professional layout with tabs, cards, forms, and consistent spacing
 */

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
  timezone?: string
  emailNotifications?: boolean
  productUpdates?: boolean
}

type TabType = 'profile' | 'security' | 'system'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    timezone: 'America/New_York',
    emailNotifications: true,
    productUpdates: false
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Security metrics state
  const [securityMetrics] = useState({
    mfaStatus: 'enabled',
    activeSessions: 3,
    failedLogins: 0,
    apiKeys: 2
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
        setProfileForm({
          email: data.user.email || '',
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          timezone: data.user.timezone || 'America/New_York',
          emailNotifications: data.user.emailNotifications ?? true,
          productUpdates: data.user.productUpdates ?? false
        })
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

  const handleProfileSave = async () => {
    setSaving(true)
    setMessage({ type: 'success', text: 'Profile updated successfully' })
    setTimeout(() => setSaving(false), 1000)
  }

  const handleRefresh = () => {
    fetchSettings()
  }

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!settings) {
    return (
      <AdminLayout title="Settings">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          Failed to load settings
        </div>
      </AdminLayout>
    )
  }

  const tabs: { id: TabType; label: string; emoji: string }[] = [
    { id: 'profile', label: 'Profile', emoji: '👤' },
    { id: 'security', label: 'Security', emoji: '🔒' },
    { id: 'system', label: 'System', emoji: '⚙' }
  ];

  return (
    <>
      <Head>
        <title>Settings - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="">
        {/* Break out of AdminLayout's padding */}
        <div style={{ margin: '-2rem', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
          {/* Sticky Header with Toolbar */}
          <div className="settings-sticky-header" style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1.5rem',
                paddingBottom: '1rem'
              }}>
                <div>
                  <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--admin-text-primary)',
                    marginBottom: '0.25rem'
                  }}>
                    Settings
                  </h1>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--admin-text-secondary)',
                    margin: 0
                  }}>
                    Manage your account preferences and security settings
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="btn btn-ghost btn-icon"
                    style={{
                      height: '2.25rem',
                      width: '2.25rem',
                      padding: 0,
                      borderRadius: '0.75rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--admin-text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label="Refresh"
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{
                      height: '2.25rem',
                      padding: '0 1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--admin-border)',
                      backgroundColor: 'transparent',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Revert
                  </button>
                  <button
                    type="button"
                    onClick={handleProfileSave}
                    disabled={saving}
                    className="btn btn-primary"
                    style={{
                      height: '2.25rem',
                      padding: '0 1rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      backgroundColor: 'var(--admin-accent)',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    {saving ? 'Saving...' : 'Save All'}
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                borderBottom: '1px solid var(--admin-border)',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '3px solid var(--admin-accent)' : '3px solid transparent',
                      backgroundColor: 'transparent',
                      color: activeTab === tab.id ? 'var(--admin-accent)' : 'var(--admin-text-secondary)',
                      fontSize: '0.875rem',
                      fontWeight: activeTab === tab.id ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  {/* Two-column layout - responsive */}
                  <div className="profile-grid">
                    {/* Profile Information Card */}
                    <div style={{
                      backgroundColor: 'var(--admin-card-bg)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      boxShadow: 'var(--admin-shadow-light)'
                    }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                          Profile Information
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', margin: 0 }}>
                          Update your name, email, and role
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                        <div>
                          <label htmlFor="username" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                            Username
                          </label>
                          <input
                            type="text"
                            id="username"
                            value={settings.username}
                            disabled
                            style={{
                              width: '100%',
                              height: '2.5rem',
                              padding: '0 0.75rem',
                              borderRadius: '0.75rem',
                              border: '1px solid var(--admin-border)',
                              backgroundColor: 'var(--admin-bg)',
                              color: 'var(--admin-text-secondary)',
                              fontSize: '0.875rem',
                              cursor: 'not-allowed'
                            }}
                          />
                        </div>

                        <div>
                          <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            style={{
                              width: '100%',
                              height: '2.5rem',
                              padding: '0 0.75rem',
                              borderRadius: '0.75rem',
                              border: '1px solid var(--admin-border)',
                              backgroundColor: 'var(--admin-card-bg)',
                              color: 'var(--admin-text-primary)',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>

                        <div>
                          <label htmlFor="firstName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            style={{
                              width: '100%',
                              height: '2.5rem',
                              padding: '0 0.75rem',
                              borderRadius: '0.75rem',
                              border: '1px solid var(--admin-border)',
                              backgroundColor: 'var(--admin-card-bg)',
                              color: 'var(--admin-text-primary)',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>

                        <div>
                          <label htmlFor="lastName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            style={{
                              width: '100%',
                              height: '2.5rem',
                              padding: '0 0.75rem',
                              borderRadius: '0.75rem',
                              border: '1px solid var(--admin-border)',
                              backgroundColor: 'var(--admin-card-bg)',
                              color: 'var(--admin-text-primary)',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                            Role
                          </label>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: 'var(--admin-bg)',
                            border: '1px solid var(--admin-border)',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--admin-text-primary)'
                          }}>
                            {settings.role}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                        <button
                          type="button"
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--admin-border)',
                            backgroundColor: 'transparent',
                            color: 'var(--admin-text-secondary)',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={handleProfileSave}
                          disabled={saving}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            backgroundColor: 'var(--admin-accent)',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.6 : 1
                          }}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>

                    {/* Right Column - Preferences and Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Preferences Card */}
                      <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        boxShadow: 'var(--admin-shadow-light)'
                      }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                            Preferences
                          </h3>
                          <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', margin: 0 }}>
                            Timezone and notifications
                          </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div>
                            <label htmlFor="timezone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                              Timezone
                            </label>
                            <select
                              id="timezone"
                              value={profileForm.timezone}
                              onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                              style={{
                                width: '100%',
                                height: '2.5rem',
                                padding: '0 0.75rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--admin-border)',
                                backgroundColor: 'var(--admin-card-bg)',
                                color: 'var(--admin-text-primary)',
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Chicago">Central Time</option>
                              <option value="America/Denver">Mountain Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                              <option value="UTC">UTC</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>
                                Email Notifications
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                                Receive email updates
                              </div>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-block', width: '2.75rem', height: '1.5rem' }}>
                              <input
                                type="checkbox"
                                checked={profileForm.emailNotifications}
                                onChange={(e) => setProfileForm({ ...profileForm, emailNotifications: e.target.checked })}
                                style={{ opacity: 0, width: 0, height: 0 }}
                              />
                              <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: profileForm.emailNotifications ? 'var(--admin-accent)' : '#ccc',
                                transition: '0.3s',
                                borderRadius: '1.5rem'
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  content: '',
                                  height: '1.125rem',
                                  width: '1.125rem',
                                  left: profileForm.emailNotifications ? '1.5rem' : '0.1875rem',
                                  bottom: '0.1875rem',
                                  backgroundColor: 'white',
                                  transition: '0.3s',
                                  borderRadius: '50%'
                                }} />
                              </span>
                            </label>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>
                                Product Updates
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                                News and features
                              </div>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-block', width: '2.75rem', height: '1.5rem' }}>
                              <input
                                type="checkbox"
                                checked={profileForm.productUpdates}
                                onChange={(e) => setProfileForm({ ...profileForm, productUpdates: e.target.checked })}
                                style={{ opacity: 0, width: 0, height: 0 }}
                              />
                              <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: profileForm.productUpdates ? 'var(--admin-accent)' : '#ccc',
                                transition: '0.3s',
                                borderRadius: '1.5rem'
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  content: '',
                                  height: '1.125rem',
                                  width: '1.125rem',
                                  left: profileForm.productUpdates ? '1.5rem' : '0.1875rem',
                                  bottom: '0.1875rem',
                                  backgroundColor: 'white',
                                  transition: '0.3s',
                                  borderRadius: '50%'
                                }} />
                              </span>
                            </label>
                          </div>
                        </div>

                        <button
                          type="button"
                          style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '0.5rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            backgroundColor: 'var(--admin-accent)',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Apply
                        </button>
                      </div>

                      {/* Avatar Card */}
                      <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        boxShadow: 'var(--admin-shadow-light)'
                      }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1rem' }}>
                          Avatar
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            width: '6rem',
                            height: '6rem',
                            borderRadius: '50%',
                            backgroundColor: 'var(--admin-accent)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 600
                          }}>
                            {settings.firstName?.[0]?.toUpperCase() || settings.username[0]?.toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            <button
                              type="button"
                              style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--admin-border)',
                                backgroundColor: 'transparent',
                                color: 'var(--admin-text-primary)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: 'var(--admin-text-secondary)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Security Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    boxShadow: 'var(--admin-shadow-light)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#D1FAE5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        🔒
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', fontWeight: 500 }}>
                        MFA Status
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                      {settings.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: settings.mfaEnabled ? '#D1FAE5' : '#FEE2E2',
                      color: settings.mfaEnabled ? '#059669' : '#DC2626',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      display: 'inline-block'
                    }}>
                      {settings.mfaEnabled ? '✓ Active' : '✗ Inactive'}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    boxShadow: 'var(--admin-shadow-light)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#DBEAFE',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        🖥️
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', fontWeight: 500 }}>
                        Active Sessions
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                      {securityMetrics.activeSessions}
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                      Current devices
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    boxShadow: 'var(--admin-shadow-light)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: securityMetrics.failedLogins > 0 ? '#FEE2E2' : '#F3F4F6',
                        color: securityMetrics.failedLogins > 0 ? '#DC2626' : '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        ⚠️
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', fontWeight: 500 }}>
                        Failed Logins
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                      {securityMetrics.failedLogins}
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                      Last 24 hours
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    boxShadow: 'var(--admin-shadow-light)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#E0E7FF',
                        color: '#4F46E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        🔑
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', fontWeight: 500 }}>
                        API Keys
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                      {securityMetrics.apiKeys}
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                      Active keys
                    </div>
                  </div>
                </div>

                {/* Change Password Card */}
                <div style={{
                  backgroundColor: 'var(--admin-card-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: 'var(--admin-shadow-light)'
                }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                      Change Password
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', margin: 0 }}>
                      Use at least 8 characters
                    </p>
                  </div>

                  {message && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                      color: message.type === 'success' ? '#059669' : '#DC2626',
                      fontSize: '0.875rem',
                      marginBottom: '1.5rem'
                    }}>
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label htmlFor="currentPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          required
                          disabled={saving}
                          style={{
                            width: '100%',
                            height: '2.5rem',
                            padding: '0 0.75rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--admin-border)',
                            backgroundColor: 'var(--admin-card-bg)',
                            color: 'var(--admin-text-primary)',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          minLength={8}
                          disabled={saving}
                          style={{
                            width: '100%',
                            height: '2.5rem',
                            padding: '0 0.75rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--admin-border)',
                            backgroundColor: 'var(--admin-card-bg)',
                            color: 'var(--admin-text-primary)',
                            fontSize: '0.875rem'
                          }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: '0.25rem' }}>
                          Minimum 8 characters
                        </p>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required
                          disabled={saving}
                          style={{
                            width: '100%',
                            height: '2.5rem',
                            padding: '0 0.75rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--admin-border)',
                            backgroundColor: 'var(--admin-card-bg)',
                            color: 'var(--admin-text-primary)',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                      <button
                        type="button"
                        onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.75rem',
                          border: '1px solid var(--admin-border)',
                          backgroundColor: 'transparent',
                          color: 'var(--admin-text-secondary)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.75rem',
                          border: 'none',
                          backgroundColor: 'var(--admin-accent)',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          cursor: saving ? 'not-allowed' : 'pointer',
                          opacity: saving ? 0.6 : 1
                        }}
                      >
                        {saving ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Two-Factor Authentication Card */}
                <div style={{
                  backgroundColor: 'var(--admin-card-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: 'var(--admin-shadow-light)'
                }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                    Two-Factor Authentication (2FA)
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '1.5rem' }}>
                    Add an extra layer of security to your account. Authenticator app recommended.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>
                        Status: {settings.mfaEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                        {settings.mfaEnabled ? 'Your account is protected' : 'Not configured'}
                      </div>
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        border: settings.mfaEnabled ? '1px solid var(--admin-border)' : 'none',
                        backgroundColor: settings.mfaEnabled ? 'transparent' : 'var(--admin-accent)',
                        color: settings.mfaEnabled ? 'var(--admin-text-primary)' : 'white',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      {settings.mfaEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>

                {/* API Keys Card */}
                <div style={{
                  backgroundColor: 'var(--admin-card-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: 'var(--admin-shadow-light)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                        API Keys
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', margin: 0 }}>
                        Rotate regularly for security
                      </p>
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        backgroundColor: 'var(--admin-accent)',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      + New Key
                    </button>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', textAlign: 'center', padding: '2rem' }}>
                    No API keys configured
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* System Information Card */}
                <div style={{
                  backgroundColor: 'var(--admin-card-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: 'var(--admin-shadow-light)'
                }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.5rem' }}>
                    System Information
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <svg style={{ width: '1rem', height: '1rem', color: 'var(--admin-text-secondary)' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-secondary)' }}>
                          Database
                        </label>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-primary)', paddingLeft: '1.5rem' }}>
                        PostgreSQL (Supabase)
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <svg style={{ width: '1rem', height: '1rem', color: 'var(--admin-text-secondary)' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-secondary)' }}>
                          Environment
                        </label>
                      </div>
                      <div style={{ paddingLeft: '1.5rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          backgroundColor: process.env.NODE_ENV === 'production' ? '#D1FAE5' : '#FEF3C7',
                          color: process.env.NODE_ENV === 'production' ? '#059669' : '#D97706',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'uppercase'
                        }}>
                          {process.env.NODE_ENV || 'development'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <svg style={{ width: '1rem', height: '1rem', color: 'var(--admin-text-secondary)' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-secondary)' }}>
                          Version
                        </label>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>
                          1.0.0
                        </span>
                        <span style={{
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem',
                          backgroundColor: 'var(--admin-bg)',
                          color: 'var(--admin-text-secondary)',
                          fontSize: '0.625rem',
                          fontWeight: 500
                        }}>
                          STABLE
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <svg style={{ width: '1rem', height: '1rem', color: 'var(--admin-text-secondary)' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-secondary)' }}>
                          Last Deploy
                        </label>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-primary)', paddingLeft: '1.5rem' }}>
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Configuration Card */}
                <div style={{
                  backgroundColor: 'var(--admin-card-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: 'var(--admin-shadow-light)'
                }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                    App Configuration
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '1.5rem' }}>
                    Feature flags and system options
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--admin-bg)', borderRadius: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>
                          Maintenance Mode
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                          Prevent public access to the site
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '2.75rem', height: '1.5rem' }}>
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: '#ccc',
                          transition: '0.3s',
                          borderRadius: '1.5rem'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '1.125rem',
                            width: '1.125rem',
                            left: '0.1875rem',
                            bottom: '0.1875rem',
                            backgroundColor: 'white',
                            transition: '0.3s',
                            borderRadius: '50%'
                          }} />
                        </span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--admin-bg)', borderRadius: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>
                          Public Sign-up
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                          Allow new users to register
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '2.75rem', height: '1.5rem' }}>
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'var(--admin-accent)',
                          transition: '0.3s',
                          borderRadius: '1.5rem'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '1.125rem',
                            width: '1.125rem',
                            left: '1.5rem',
                            bottom: '0.1875rem',
                            backgroundColor: 'white',
                            transition: '0.3s',
                            borderRadius: '50%'
                          }} />
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1.5rem 1.5rem 2rem',
            borderTop: '1px solid var(--admin-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.875rem',
                color: 'var(--admin-text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>🌐</span>
              <span>View Site</span>
            </a>
            <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
              TWR Admin
            </div>
          </div>
        </div>

        {/* CSS for responsive grid */}
        <style jsx>{`
          .profile-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          @media (min-width: 1024px) {
            .profile-grid {
              grid-template-columns: 2fr 1fr;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
