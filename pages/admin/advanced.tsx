/**
 * Admin Advanced View Page
 * Advanced dashboard with detailed metrics and data visualization
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface AdvancedMetrics {
  database: {
    connections: number
    maxConnections: number
    queryTime: number
    slowQueries: number
    cacheHitRate: number
  }
  performance: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkLatency: number
  }
  content: {
    totalRecords: number
    drafts: number
    published: number
    archived: number
    growthRate: number
  }
  system: {
    uptime: string
    version: string
    lastBackup: string
    queuedJobs: number
  }
}

export default function AdvancedViewPage() {
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000)
  const router = useRouter()

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const fetchMetrics = async () => {
    try {
      // Simulated data - replace with actual API call
      setMetrics({
        database: {
          connections: 23,
          maxConnections: 100,
          queryTime: 45,
          slowQueries: 3,
          cacheHitRate: 92.5
        },
        performance: {
          cpuUsage: 34.2,
          memoryUsage: 67.8,
          diskUsage: 42.1,
          networkLatency: 12.5
        },
        content: {
          totalRecords: 5432,
          drafts: 87,
          published: 5234,
          archived: 111,
          growthRate: 8.7
        },
        system: {
          uptime: '45 days, 3 hours',
          version: 'v2.4.1',
          lastBackup: '2 hours ago',
          queuedJobs: 12
        }
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      setLoading(false)
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
                <h1 className="text-2xl font-bold text-gray-900">Advanced Dashboard</h1>
                <p className="text-gray-500 mt-1">Detailed system metrics and performance monitoring</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value={10000}>Refresh: 10s</option>
                  <option value={30000}>Refresh: 30s</option>
                  <option value={60000}>Refresh: 1m</option>
                  <option value={300000}>Refresh: 5m</option>
                </select>
                <button
                  onClick={fetchMetrics}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Refresh Now
                </button>
              </div>
            </div>
          </div>

          {/* Database Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🗄️ Database Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Connections</p>
                <p className="text-xl font-bold text-gray-900">
                  {metrics?.database.connections}/{metrics?.database.maxConnections}
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{width: `${(metrics?.database.connections! / metrics?.database.maxConnections!) * 100}%`}}
                  ></div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Avg Query Time</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.database.queryTime}ms</p>
                <p className={`text-xs mt-1 ${metrics?.database.queryTime! < 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {metrics?.database.queryTime! < 100 ? 'Optimal' : 'Elevated'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Slow Queries</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.database.slowQueries}</p>
                <p className={`text-xs mt-1 ${metrics?.database.slowQueries! > 5 ? 'text-red-600' : 'text-gray-500'}`}>
                  Last hour
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Cache Hit Rate</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.database.cacheHitRate}%</p>
                <p className={`text-xs mt-1 ${metrics?.database.cacheHitRate! > 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {metrics?.database.cacheHitRate! > 90 ? 'Excellent' : 'Could be better'}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Health Score</p>
                <p className="text-xl font-bold text-blue-900">94/100</p>
                <p className="text-xs text-blue-600 mt-1">Healthy</p>
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ System Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                    <span className="text-sm font-bold text-gray-900">{metrics?.performance.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${metrics?.performance.cpuUsage! > 80 ? 'bg-red-600' : metrics?.performance.cpuUsage! > 60 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{width: `${metrics?.performance.cpuUsage}%`}}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                    <span className="text-sm font-bold text-gray-900">{metrics?.performance.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${metrics?.performance.memoryUsage! > 80 ? 'bg-red-600' : metrics?.performance.memoryUsage! > 60 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{width: `${metrics?.performance.memoryUsage}%`}}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                    <span className="text-sm font-bold text-gray-900">{metrics?.performance.diskUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${metrics?.performance.diskUsage! > 80 ? 'bg-red-600' : metrics?.performance.diskUsage! > 60 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{width: `${metrics?.performance.diskUsage}%`}}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Network Latency</span>
                    <span className="text-sm font-bold text-gray-900">{metrics?.performance.networkLatency}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${metrics?.performance.networkLatency! > 50 ? 'bg-red-600' : metrics?.performance.networkLatency! > 20 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{width: `${Math.min((metrics?.performance.networkLatency! / 100) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Content Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">Total Records</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics?.content.totalRecords?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-1">Published</p>
                  <p className="text-2xl font-bold text-green-900">{metrics?.content.published?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700 mb-1">Drafts</p>
                  <p className="text-2xl font-bold text-yellow-900">{metrics?.content.drafts}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 mb-1">Archived</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.content.archived}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-green-700">Growth Rate</p>
                    <p className="text-xl font-bold text-green-900">+{metrics?.content.growthRate}%</p>
                  </div>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-xs text-green-600 mt-1">Last 30 days</p>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Uptime</p>
                <p className="font-semibold text-gray-900">{metrics?.system.uptime}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Version</p>
                <p className="font-semibold text-gray-900">{metrics?.system.version}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Last Backup</p>
                <p className="font-semibold text-gray-900">{metrics?.system.lastBackup}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Queued Jobs</p>
                <p className="font-semibold text-gray-900">{metrics?.system.queuedJobs}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}