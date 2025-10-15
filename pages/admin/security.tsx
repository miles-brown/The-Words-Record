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
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
            <p className="text-gray-500 mt-1">Monitor security events and manage access controls</p>

            {/* Tab Navigation */}
            <div className="flex gap-4 mt-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'events'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Security Events
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Security Score */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm p-6 mb-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Security Score</h2>
                    <p className="text-3xl font-bold text-green-600 mt-2">85/100</p>
                    <p className="text-sm text-gray-600 mt-1">Good - Some improvements recommended</p>
                  </div>
                  <div className="text-6xl">🛡️</div>
                </div>
              </div>

              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">23</p>
                    </div>
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Failed Logins (24h)</p>
                      <p className="text-2xl font-bold text-yellow-600">7</p>
                    </div>
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">MFA Enabled</p>
                      <p className="text-2xl font-bold text-green-600">89%</p>
                    </div>
                    <span className="text-2xl">🔐</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">API Keys</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                    <span className="text-2xl">🔑</span>
                  </div>
                </div>
              </div>

              {/* Recent Security Events */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          event.risk === 'high' ? 'bg-red-500' :
                          event.risk === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></span>
                        <div>
                          <p className="font-medium text-gray-900">{event.description}</p>
                          <p className="text-sm text-gray-500">{event.user} • {event.timestamp}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{event.ipAddress}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Security Events Log</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Export Logs
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Risk</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Event</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">IP Address</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            event.risk === 'high' ? 'bg-red-100 text-red-700' :
                            event.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {event.risk}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900">{event.description}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{event.user}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{event.ipAddress}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{event.timestamp}</td>
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Require MFA</p>
                      <p className="text-sm text-gray-500">Two-factor authentication for all users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.mfaRequired}
                        onChange={(e) => updateSetting('mfaRequired', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Complexity
                    </label>
                    <select
                      value={settings.passwordComplexity}
                      onChange={(e) => updateSetting('passwordComplexity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low - 8+ characters</option>
                      <option value="medium">Medium - 10+ chars with mixed case</option>
                      <option value="high">High - 12+ chars with special characters</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Control</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">IP Whitelist</p>
                      <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.ipWhitelist}
                        onChange={(e) => updateSetting('ipWhitelist', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Rate Limit (per hour)
                    </label>
                    <input
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Data Encryption</p>
                      <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.dataEncryption}
                        onChange={(e) => updateSetting('dataEncryption', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
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