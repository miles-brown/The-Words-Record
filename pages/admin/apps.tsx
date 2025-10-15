/**
 * Admin Apps Page
 * Manage integrations, API access, and third-party applications
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface App {
  id: string
  name: string
  description: string
  icon: string
  status: 'active' | 'inactive' | 'pending'
  type: 'integration' | 'api' | 'webhook' | 'plugin'
  lastUsed: string
  apiCalls?: number
  permissions: string[]
}

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    try {
      setLoading(true)
      // Simulated data - replace with actual API call
      setTimeout(() => {
        setApps([
          {
            id: '1',
            name: 'Slack Integration',
            description: 'Send notifications to Slack channels',
            icon: '💬',
            status: 'active',
            type: 'integration',
            lastUsed: '2 hours ago',
            permissions: ['read:cases', 'read:statements']
          },
          {
            id: '2',
            name: 'Analytics API',
            description: 'External analytics data access',
            icon: '📊',
            status: 'active',
            type: 'api',
            lastUsed: '1 day ago',
            apiCalls: 1234,
            permissions: ['read:analytics', 'read:users']
          },
          {
            id: '3',
            name: 'Content Webhook',
            description: 'Webhook for content updates',
            icon: '🔔',
            status: 'active',
            type: 'webhook',
            lastUsed: '5 minutes ago',
            permissions: ['read:content', 'write:content']
          },
          {
            id: '4',
            name: 'Export Plugin',
            description: 'Advanced data export functionality',
            icon: '📥',
            status: 'inactive',
            type: 'plugin',
            lastUsed: '1 week ago',
            permissions: ['read:all', 'export:data']
          },
          {
            id: '5',
            name: 'Twitter Bot',
            description: 'Automated Twitter posting',
            icon: '🐦',
            status: 'pending',
            type: 'integration',
            lastUsed: 'Never',
            permissions: ['read:cases', 'write:social']
          }
        ])
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Failed to fetch apps:', error)
      setLoading(false)
    }
  }

  const toggleAppStatus = (appId: string) => {
    setApps(apps.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: app.status === 'active' ? 'inactive' : 'active'
        }
      }
      return app
    }))
  }

  if (loading) {
    return (
      <AdminLayout title="Apps">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Apps - TWR Admin</title>
      </Head>

      <AdminLayout title="Apps">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Apps & Integrations</h1>
                <p className="text-gray-500 mt-1">Manage third-party apps and API access</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                + Add New App
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Apps</p>
                  <p className="text-2xl font-bold text-gray-900">{apps.length}</p>
                </div>
                <span className="text-2xl">📱</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {apps.filter(a => a.status === 'active').length}
                  </p>
                </div>
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">API Calls Today</p>
                  <p className="text-2xl font-bold text-gray-900">5,432</p>
                </div>
                <span className="text-2xl">🔌</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {apps.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {apps.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{app.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{app.name}</h3>
                      <p className="text-sm text-gray-500">{app.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : app.status === 'inactive'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {app.status}
                    </span>
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      ⚙️
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium text-gray-900 capitalize">{app.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Used</span>
                    <span className="font-medium text-gray-900">{app.lastUsed}</span>
                  </div>
                  {app.apiCalls && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">API Calls</span>
                      <span className="font-medium text-gray-900">{app.apiCalls.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {app.permissions.map((perm, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAppStatus(app.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      app.status === 'active'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {app.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New App Section */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Need to integrate something new?</h3>
                <p className="text-gray-600 mt-1">Browse our app marketplace or create a custom integration</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300">
                  Browse Marketplace
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Custom App
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}