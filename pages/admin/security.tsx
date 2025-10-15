/**
 * Admin Security Page
 * Security settings, audit logs, and access control management
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'permission_change' | 'data_export' | 'suspicious'
  user: string
  description: string
  timestamp: string
  ipAddress: string
  risk: 'low' | 'medium' | 'high'
}

interface SecuritySettings {
  mfaRequired: boolean
  sessionTimeout: number
  passwordComplexity: 'low' | 'medium' | 'high'
  ipWhitelist: boolean
  apiRateLimit: number
  dataEncryption: boolean
}

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [settings, setSettings] = useState<SecuritySettings>({
    mfaRequired: true,
    sessionTimeout: 30,
    passwordComplexity: 'high',
    ipWhitelist: false,
    apiRateLimit: 1000,
    dataEncryption: true
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'settings'>('overview')
  const router = useRouter()

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      setLoading(true)
      // Simulated data - replace with actual API call
      setTimeout(() => {
        setEvents([
          {
            id: '1',
            type: 'login',
            user: 'admin@example.com',
            description: 'Successful login',
            timestamp: '10 minutes ago',
            ipAddress: '192.168.1.1',
            risk: 'low'
          },
          {
            id: '2',
            type: 'failed_login',
            user: 'unknown@test.com',
            description: 'Failed login attempt - invalid credentials',
            timestamp: '25 minutes ago',
            ipAddress: '203.0.113.42',
            risk: 'medium'
          },
          {
            id: '3',
            type: 'permission_change',
            user: 'editor@example.com',
            description: 'User role updated from Editor to Admin',
            timestamp: '1 hour ago',
            ipAddress: '192.168.1.2',
            risk: 'medium'
          },
          {
            id: '4',
            type: 'data_export',
            user: 'admin@example.com',
            description: 'Exported 500 records',
            timestamp: '3 hours ago',
            ipAddress: '192.168.1.1',
            risk: 'low'
          },
          {
            id: '5',
            type: 'suspicious',
            user: 'test@example.com',
            description: 'Multiple failed login attempts detected',
            timestamp: '5 hours ago',
            ipAddress: '198.51.100.78',
            risk: 'high'
          }
        ])
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Failed to fetch security data:', error)
      setLoading(false)
    }
  }

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <AdminLayout title="Security">
        <div className="flex items-center justify-center py-20">
          <div className="admin-spinner admin-spinner-lg"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Security - TWR Admin</title>
      </Head>

      <AdminLayout title="Security">
        <div className="admin-section">
          {/* Header */}
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Security Center</h1>
              <p className="admin-subtitle">Monitor security events and manage access controls</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="admin-tabs-container mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`admin-tab ${activeTab === 'overview' ? 'admin-tab-active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`admin-tab ${activeTab === 'events' ? 'admin-tab-active' : ''}`}
            >
              Security Events
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`admin-tab ${activeTab === 'settings' ? 'admin-tab-active' : ''}`}
            >
              Settings
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Security Score */}
              <div className="admin-card admin-card-gradient mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="admin-card-title">Security Score</h2>
                    <p className="text-4xl font-bold text-green-400 mt-2">85/100</p>
                    <p className="text-sm text-gray-400 mt-1">Good - Some improvements recommended</p>
                  </div>
                  <div className="text-6xl">🛡️</div>
                </div>
              </div>

              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="admin-metric-card admin-metric-green">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="admin-metric-label">Active Sessions</p>
                      <p className="admin-metric-value">23</p>
                    </div>
                    <span className="text-3xl">👥</span>
                  </div>
                </div>
                <div className="admin-metric-card admin-metric-amber">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="admin-metric-label">Failed Logins (24h)</p>
                      <p className="admin-metric-value text-yellow-600 dark:text-yellow-400">7</p>
                    </div>
                    <span className="text-3xl">⚠️</span>
                  </div>
                </div>
                <div className="admin-metric-card admin-metric-green">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="admin-metric-label">MFA Enabled</p>
                      <p className="admin-metric-value text-green-600 dark:text-green-400">89%</p>
                    </div>
                    <span className="text-3xl">🔐</span>
                  </div>
                </div>
                <div className="admin-metric-card admin-metric-blue">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="admin-metric-label">API Keys</p>
                      <p className="admin-metric-value">12</p>
                    </div>
                    <span className="text-3xl">🔑</span>
                  </div>
                </div>
              </div>

              {/* Recent Security Events */}
              <div className="admin-card">
                <h2 className="admin-card-title mb-6">Recent Activity</h2>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="admin-list-item">
                      <div className="flex items-center gap-3">
                        <span className={`admin-status-indicator ${
                          event.risk === 'high' ? 'admin-status-error' :
                          event.risk === 'medium' ? 'admin-status-warning' :
                          'admin-status-success'
                        }`}></span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{event.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{event.user} • {event.timestamp}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{event.ipAddress}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="admin-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="admin-card-title">Security Events Log</h2>
                <button className="admin-btn admin-btn-primary">
                  Export Logs
                </button>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Risk</th>
                      <th>Event</th>
                      <th>User</th>
                      <th>IP Address</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <span className={`admin-badge ${
                            event.risk === 'high' ? 'admin-badge-danger' :
                            event.risk === 'medium' ? 'admin-badge-warning' :
                            'admin-badge-success'
                          }`}>
                            {event.risk}
                          </span>
                        </td>
                        <td>
                          <p className="text-sm font-medium">{event.description}</p>
                        </td>
                        <td className="text-sm">{event.user}</td>
                        <td className="text-sm">{event.ipAddress}</td>
                        <td className="text-sm">{event.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="admin-card">
                <h2 className="admin-card-title mb-6">Authentication</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Require MFA</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Two-factor authentication for all users</p>
                    </div>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={settings.mfaRequired}
                        onChange={(e) => updateSetting('mfaRequired', e.target.checked)}
                      />
                      <span className="admin-toggle-slider"></span>
                    </label>
                  </div>

                  <div>
                    <label className="admin-label">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label">
                      Password Complexity
                    </label>
                    <select
                      value={settings.passwordComplexity}
                      onChange={(e) => updateSetting('passwordComplexity', e.target.value)}
                      className="admin-select"
                    >
                      <option value="low">Low - 8+ characters</option>
                      <option value="medium">Medium - 10+ chars with mixed case</option>
                      <option value="high">High - 12+ chars with special characters</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <h2 className="admin-card-title mb-6">Access Control</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">IP Whitelist</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Restrict access to specific IP addresses</p>
                    </div>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={settings.ipWhitelist}
                        onChange={(e) => updateSetting('ipWhitelist', e.target.checked)}
                      />
                      <span className="admin-toggle-slider"></span>
                    </label>
                  </div>

                  <div>
                    <label className="admin-label">
                      API Rate Limit (per hour)
                    </label>
                    <input
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                      className="admin-input"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Data Encryption</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Encrypt sensitive data at rest</p>
                    </div>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={settings.dataEncryption}
                        onChange={(e) => updateSetting('dataEncryption', e.target.checked)}
                      />
                      <span className="admin-toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <button className="admin-btn admin-btn-primary admin-btn-lg w-full">
                  Save Security Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  )
}