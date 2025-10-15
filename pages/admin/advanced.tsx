/**
 * Admin Advanced View Page
 * Comprehensive system monitoring dashboard with 9 key components
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface SystemHealth {
  uptime: string
  network: { status: string; latency: number }
  server: { cpu: number; memory: number; disk: number }
  domain: { ssl: boolean; expiry: string }
}

interface ErrorLog {
  id: string
  type: 'frontend' | 'backend' | 'api'
  message: string
  stack?: string
  timestamp: string
  severity: 'error' | 'warning' | 'info'
}

interface ApiRequest {
  id: string
  method: string
  endpoint: string
  status: number
  duration: number
  timestamp: string
}

interface DatabaseTable {
  name: string
  rowCount: number
  size: string
  lastModified: string
}

export default function AdvancedViewPage() {
  const [activeComponent, setActiveComponent] = useState<number>(1)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [apiRequests, setApiRequests] = useState<ApiRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, activeComponent])

  const fetchData = async () => {
    try {
      // Simulated data - replace with actual API calls
      setSystemHealth({
        uptime: '45 days, 3:24:15',
        network: { status: 'healthy', latency: 12.5 },
        server: { cpu: 34, memory: 67, disk: 42 },
        domain: { ssl: true, expiry: '90 days' }
      })

      setErrors([
        {
          id: '1',
          type: 'frontend',
          message: 'TypeError: Cannot read property "id" of undefined',
          stack: 'at ProfileCard.tsx:45',
          timestamp: '2 min ago',
          severity: 'error'
        },
        {
          id: '2',
          type: 'backend',
          message: 'Database connection timeout',
          timestamp: '15 min ago',
          severity: 'warning'
        },
        {
          id: '3',
          type: 'api',
          message: 'Rate limit exceeded for IP 192.168.1.100',
          timestamp: '1 hour ago',
          severity: 'info'
        }
      ])

      setApiRequests([
        { id: '1', method: 'GET', endpoint: '/api/admin/dashboard', status: 200, duration: 145, timestamp: 'Just now' },
        { id: '2', method: 'POST', endpoint: '/api/cases', status: 201, duration: 234, timestamp: '1 min ago' },
        { id: '3', method: 'GET', endpoint: '/api/people', status: 200, duration: 89, timestamp: '2 min ago' },
        { id: '4', method: 'DELETE', endpoint: '/api/organizations/1', status: 500, duration: 567, timestamp: '5 min ago' }
      ])

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const components = [
    { id: 1, name: 'Server Health Monitor', icon: '🔧', category: 'system' },
    { id: 2, name: 'Error Log Viewer', icon: '🚨', category: 'system' },
    { id: 3, name: 'API Request Monitor', icon: '📡', category: 'system' },
    { id: 4, name: 'Build Performance', icon: '⚡', category: 'system' },
    { id: 5, name: 'Cache Manager', icon: '💾', category: 'system' },
    { id: 6, name: 'Database Inspector', icon: '🗄️', category: 'database' },
    { id: 7, name: 'Migration Tracker', icon: '📝', category: 'database' },
    { id: 8, name: 'Data Integrity Checker', icon: '✅', category: 'database' },
    { id: 9, name: 'Backup & Restore', icon: '💿', category: 'database' }
  ]

  const renderComponent = () => {
    switch (activeComponent) {
      case 1: // Server Health Monitor
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">Uptime</span>
                  <span className="text-2xl">⏱️</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{systemHealth?.uptime}</p>
                <p className="text-xs text-green-600 mt-1">99.99% availability</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Network</span>
                  <span className="text-2xl">🌐</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{systemHealth?.network.latency}ms</p>
                <p className="text-xs text-blue-600 mt-1">Latency {systemHealth?.network.status}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">SSL Certificate</span>
                  <span className="text-2xl">🔒</span>
                </div>
                <p className="text-lg font-bold text-purple-900">Valid</p>
                <p className="text-xs text-purple-600 mt-1">Expires in {systemHealth?.domain.expiry}</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-700">Domain Status</span>
                  <span className="text-2xl">🌍</span>
                </div>
                <p className="text-lg font-bold text-amber-900">Active</p>
                <p className="text-xs text-amber-600 mt-1">All services operational</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm font-bold">{systemHealth?.server.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full transition-all" style={{width: `${systemHealth?.server.cpu}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Memory</span>
                    <span className="text-sm font-bold">{systemHealth?.server.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-600 h-3 rounded-full transition-all" style={{width: `${systemHealth?.server.memory}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Disk Space</span>
                    <span className="text-sm font-bold">{systemHealth?.server.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-600 h-3 rounded-full transition-all" style={{width: `${systemHealth?.server.disk}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2: // Error Log Viewer
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                  Errors ({errors.filter(e => e.severity === 'error').length})
                </button>
                <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                  Warnings ({errors.filter(e => e.severity === 'warning').length})
                </button>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  Info ({errors.filter(e => e.severity === 'info').length})
                </button>
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Clear Logs
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {errors.map(error => (
                <div key={error.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                  error.severity === 'error' ? 'border-l-4 border-l-red-500' :
                  error.severity === 'warning' ? 'border-l-4 border-l-yellow-500' :
                  'border-l-4 border-l-blue-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          error.type === 'frontend' ? 'bg-purple-100 text-purple-700' :
                          error.type === 'backend' ? 'bg-orange-100 text-orange-700' :
                          'bg-cyan-100 text-cyan-700'
                        }`}>
                          {error.type}
                        </span>
                        <span className="text-xs text-gray-500">{error.timestamp}</span>
                      </div>
                      <p className="font-medium text-gray-900">{error.message}</p>
                      {error.stack && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">{error.stack}</p>
                      )}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 3: // API Request Monitor
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Total Requests</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-green-600">+12% from yesterday</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Avg Response Time</p>
                <p className="text-2xl font-bold">145ms</p>
                <p className="text-xs text-gray-500">Optimal performance</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Error Rate</p>
                <p className="text-2xl font-bold text-red-600">0.3%</p>
                <p className="text-xs text-gray-500">4 failed requests</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-green-600">92%</p>
                <p className="text-xs text-gray-500">Excellent</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700 uppercase">Method</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700 uppercase">Endpoint</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700 uppercase">Duration</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-700 uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {apiRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          request.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                          request.method === 'POST' ? 'bg-green-100 text-green-700' :
                          request.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {request.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{request.endpoint}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${
                          request.status >= 200 && request.status < 300 ? 'text-green-600' :
                          request.status >= 400 ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{request.duration}ms</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{request.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 4: // Build Performance
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-lg font-semibold mb-4">Lighthouse Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-green-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">98</span>
                  </div>
                  <p className="text-sm font-medium">Performance</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-green-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">100</span>
                  </div>
                  <p className="text-sm font-medium">Accessibility</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-yellow-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-yellow-600">92</span>
                  </div>
                  <p className="text-sm font-medium">Best Practices</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-green-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">95</span>
                  </div>
                  <p className="text-sm font-medium">SEO</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Bundle Size</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Main Bundle</span>
                    <span className="text-sm font-semibold">234 KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Vendor Bundle</span>
                    <span className="text-sm font-semibold">512 KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">CSS Bundle</span>
                    <span className="text-sm font-semibold">87 KB</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Size</span>
                      <span className="font-bold">833 KB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Load Times</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">First Contentful Paint</span>
                    <span className="text-sm font-semibold text-green-600">0.8s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time to Interactive</span>
                    <span className="text-sm font-semibold text-green-600">1.2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Speed Index</span>
                    <span className="text-sm font-semibold text-green-600">1.1s</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Overall Score</span>
                      <span className="font-bold text-green-600">Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5: // Cache Manager
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">CDN Cache</h3>
                  <span className="text-2xl">☁️</span>
                </div>
                <p className="text-2xl font-bold mb-1">2.3 GB</p>
                <p className="text-sm text-gray-500 mb-3">87% hit rate</p>
                <button className="w-full px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">
                  Purge CDN Cache
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Redis Cache</h3>
                  <span className="text-2xl">💾</span>
                </div>
                <p className="text-2xl font-bold mb-1">456 MB</p>
                <p className="text-sm text-gray-500 mb-3">92% hit rate</p>
                <button className="w-full px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100">
                  Clear Redis
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Browser Cache</h3>
                  <span className="text-2xl">🌐</span>
                </div>
                <p className="text-2xl font-bold mb-1">Active</p>
                <p className="text-sm text-gray-500 mb-3">Max-age: 3600s</p>
                <button className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
                  Update Headers
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Cache by Route</h3>
              <div className="space-y-3">
                {[
                  { route: '/', size: '234 KB', hits: '12,345', rate: '94%' },
                  { route: '/cases', size: '567 KB', hits: '8,901', rate: '89%' },
                  { route: '/api/admin/*', size: '123 KB', hits: '5,678', rate: '78%' },
                  { route: '/static/*', size: '890 KB', hits: '45,678', rate: '99%' }
                ].map(cache => (
                  <div key={cache.route} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium">{cache.route}</p>
                      <p className="text-xs text-gray-500">Size: {cache.size} | Hits: {cache.hits}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{cache.rate}</p>
                      <button className="text-xs text-red-600 hover:text-red-700">Clear</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 6: // Database Inspector
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Database Tables</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left pb-3 text-sm font-medium text-gray-700">Table Name</th>
                      <th className="text-left pb-3 text-sm font-medium text-gray-700">Rows</th>
                      <th className="text-left pb-3 text-sm font-medium text-gray-700">Size</th>
                      <th className="text-left pb-3 text-sm font-medium text-gray-700">Last Modified</th>
                      <th className="text-left pb-3 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: 'cases', rows: 128, size: '45 MB', modified: '2 hours ago' },
                      { name: 'statements', rows: 1942, size: '234 MB', modified: '10 min ago' },
                      { name: 'people', rows: 304, size: '12 MB', modified: '1 hour ago' },
                      { name: 'organizations', rows: 71, size: '3 MB', modified: '3 days ago' },
                      { name: 'users', rows: 23, size: '1 MB', modified: '5 min ago' }
                    ].map(table => (
                      <tr key={table.name} className="hover:bg-gray-50">
                        <td className="py-3 font-mono text-sm">{table.name}</td>
                        <td className="py-3 text-sm">{table.rows.toLocaleString()}</td>
                        <td className="py-3 text-sm">{table.size}</td>
                        <td className="py-3 text-sm text-gray-500">{table.modified}</td>
                        <td className="py-3">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View Schema
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Database Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Size</span>
                    <span className="font-semibold">295 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Tables</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Indexes</span>
                    <span className="font-semibold">34</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Connections</span>
                    <span className="font-semibold">23 / 100</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Recent Queries</h3>
                <div className="space-y-2">
                  {[
                    { query: 'SELECT * FROM cases WHERE status = ?', time: '12ms' },
                    { query: 'INSERT INTO statements...', time: '45ms' },
                    { query: 'UPDATE people SET...', time: '8ms' }
                  ].map((q, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded text-xs font-mono">
                      <p className="text-gray-700 truncate">{q.query}</p>
                      <p className="text-gray-500 mt-1">Execution time: {q.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 7: // Migration Tracker
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Migration History</h3>
              <div className="space-y-3">
                {[
                  { id: '20241015_add_topics_table', status: 'applied', date: '2024-10-15 10:30:00' },
                  { id: '20241010_add_indexes', status: 'applied', date: '2024-10-10 14:22:00' },
                  { id: '20241005_update_schema', status: 'applied', date: '2024-10-05 09:15:00' },
                  { id: '20241001_initial_migration', status: 'applied', date: '2024-10-01 08:00:00' }
                ].map(migration => (
                  <div key={migration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-mono text-sm font-medium">{migration.id}</p>
                      <p className="text-xs text-gray-500">{migration.date}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {migration.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Run Pending Migrations
                </button>
              </div>
            </div>
          </div>
        )

      case 8: // Data Integrity Checker
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Valid Records</h3>
                <p className="text-3xl font-bold text-green-700">2,468</p>
                <p className="text-sm text-green-600">All checks passed</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">Warnings</h3>
                <p className="text-3xl font-bold text-yellow-700">12</p>
                <p className="text-sm text-yellow-600">Review recommended</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">Issues Found</h3>
                <p className="text-3xl font-bold text-red-700">3</p>
                <p className="text-sm text-red-600">Action required</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Integrity Issues</h3>
              <div className="space-y-3">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 mt-1">⚠️</span>
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Orphaned Statement Records</p>
                      <p className="text-sm text-red-700 mt-1">Found 2 statements with no associated person or organization</p>
                      <button className="mt-2 text-sm text-red-700 font-medium hover:text-red-800">Fix Issue →</button>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 mt-1">⚠️</span>
                    <div className="flex-1">
                      <p className="font-medium text-yellow-900">Missing Source References</p>
                      <p className="text-sm text-yellow-700 mt-1">12 cases have incomplete source citations</p>
                      <button className="mt-2 text-sm text-yellow-700 font-medium hover:text-yellow-800">Review →</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Run Full Integrity Check
                </button>
              </div>
            </div>
          </div>
        )

      case 9: // Backup & Restore
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4">Latest Backup</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Last Backup</p>
                  <p className="font-semibold">2024-10-15 02:00:00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Size</p>
                  <p className="font-semibold">295 MB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">Successful</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Create Backup Now
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Download Latest
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Backup History</h3>
              <div className="space-y-3">
                {[
                  { date: '2024-10-15 02:00:00', size: '295 MB', type: 'Automatic', status: 'success' },
                  { date: '2024-10-14 02:00:00', size: '294 MB', type: 'Automatic', status: 'success' },
                  { date: '2024-10-13 14:30:00', size: '293 MB', type: 'Manual', status: 'success' },
                  { date: '2024-10-13 02:00:00', size: '293 MB', type: 'Automatic', status: 'success' }
                ].map((backup, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{backup.date}</p>
                      <p className="text-xs text-gray-500">{backup.type} • {backup.size}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${backup.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Restore</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Advanced View">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Advanced View - TWR Admin</title>
      </Head>

      <AdminLayout title="Advanced View">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Monitoring & Management</h1>
                <p className="text-gray-500 mt-1">Advanced tools for system administration</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  Auto-refresh (5s)
                </label>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Refresh Now
                </button>
              </div>
            </div>
          </div>

          {/* Component Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Component List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Core System</h2>
                <div className="space-y-2 mb-4">
                  {components.filter(c => c.category === 'system').map(component => (
                    <button
                      key={component.id}
                      onClick={() => setActiveComponent(component.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                        activeComponent === component.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{component.icon}</span>
                      <span className="text-sm">{component.name}</span>
                    </button>
                  ))}
                </div>

                <h2 className="font-semibold text-gray-900 mb-3 mt-6 text-sm uppercase tracking-wide">Database</h2>
                <div className="space-y-2">
                  {components.filter(c => c.category === 'database').map(component => (
                    <button
                      key={component.id}
                      onClick={() => setActiveComponent(component.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                        activeComponent === component.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{component.icon}</span>
                      <span className="text-sm">{component.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Component Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">{components.find(c => c.id === activeComponent)?.icon}</span>
                  {components.find(c => c.id === activeComponent)?.name}
                </h2>
                {renderComponent()}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}