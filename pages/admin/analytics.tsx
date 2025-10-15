/**
 * Admin Analytics Page - Comprehensive System Monitoring Dashboard
 * Three main sections: System Performance, User Behaviour, Integrations & Reliability
 */

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import {
  LineChart, Line, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, Funnel, FunnelChart, LabelList, ComposedChart
} from 'recharts'

// Interfaces for API data
interface BuildData {
  latest: {
    duration: number
    bundleSize: number
    jsAssets: number
    cssAssets: number
    timestamp: string
    status: string
  }
  history: Array<{ duration: number; timestamp: string }>
  health: 'good' | 'warning' | 'critical'
}

interface LighthouseData {
  metrics: {
    fcp: { value: number; score: number; unit: string; description: string }
    lcp: { value: number; score: number; unit: string; description: string }
    cls: { value: number; score: number; unit: string; description: string }
    tbt: { value: number; score: number; unit: string; description: string }
  }
}

interface ApiLatencyData {
  endpoints: Array<{
    path: string
    method: string
    avgLatency: number
    data: Array<{ timestamp: string; latency: number }>
  }>
}

interface ErrorData {
  daily: Array<{ date: string; errors4xx: number; errors5xx: number }>
  summary: {
    trend: { '4xx': number; '5xx': number }
  }
}

interface TrafficData {
  overview: {
    visitors: number
    sessions: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
    changes: {
      visitors: number
      sessions: number
      pageViews: number
      bounceRate: number
      avgSessionDuration: number
    }
  }
  timeSeries: Array<{ timestamp: string; visitors: number; sessions: number; pageViews: number }>
  geography: Array<{ country: string; code: string; sessions: number; percentage?: number }>
  funnel: Array<{ stage: string; value: number; dropoff: number }>
}

interface IntegrationData {
  services: Array<{
    name: string
    type: string
    status: string
    latency: number | null
    lastChecked: string
    uptime: number
  }>
}

interface ResourceData {
  database: {
    timeSeries: Array<{ timestamp: string; queries: number; cpu: number; memory: number }>
  }
  api: {
    timeSeries: Array<{ timestamp: string; requests: number; throughput: number }>
  }
  storage: {
    current: { used: number; total: number }
    breakdown: Array<{ type: string; size: number; percentage: number }>
  }
}

interface UptimeData {
  current: { uptime: number; lastDowntime: { date: string; duration: number; cause: string } }
  history: Array<{ date: string; uptime: number }>
}

export default function AnalyticsPage() {
  // State for all data sections
  const [buildData, setBuildData] = useState<BuildData | null>(null)
  const [lighthouseData, setLighthouseData] = useState<LighthouseData | null>(null)
  const [apiLatencyData, setApiLatencyData] = useState<ApiLatencyData | null>(null)
  const [errorData, setErrorData] = useState<ErrorData | null>(null)
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [integrationData, setIntegrationData] = useState<IntegrationData | null>(null)
  const [resourceData, setResourceData] = useState<ResourceData | null>(null)
  const [uptimeData, setUptimeData] = useState<UptimeData | null>(null)
  const [funnelData, setFunnelData] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Fetch all analytics data
  const fetchAllData = async () => {
    try {
      const [build, lighthouse, latency, errors, traffic, integrations, resources, uptime, funnel] = await Promise.all([
        fetch('/api/analytics/build').then(r => r.json()),
        fetch('/api/analytics/lighthouse').then(r => r.json()),
        fetch(`/api/analytics/api-latency?range=${timeRange}`).then(r => r.json()),
        fetch(`/api/analytics/errors?range=${timeRange}`).then(r => r.json()),
        fetch(`/api/analytics/traffic?range=${timeRange}`).then(r => r.json()),
        fetch('/api/analytics/integrations').then(r => r.json()),
        fetch(`/api/analytics/resources?range=${timeRange}`).then(r => r.json()),
        fetch(`/api/analytics/uptime?range=${timeRange}`).then(r => r.json()),
        fetch('/api/analytics/funnel').then(r => r.json())
      ])

      setBuildData(build)
      setLighthouseData(lighthouse)
      setApiLatencyData(latency)
      setErrorData(errors)
      setTrafficData(traffic)
      setIntegrationData(integrations)
      setResourceData(resources)
      setUptimeData(uptime)
      setFunnelData(funnel)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [timeRange])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAllData, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, timeRange])

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'
    if (score >= 50) return '#F59E0B'
    return '#EF4444'
  }


  if (loading) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  // Colors for charts matching dark theme
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4'
  }

  return (
    <>
      <Head>
        <title>Analytics Dashboard - TWR Admin</title>
      </Head>

      <AdminLayout title="Analytics Dashboard">
        <div className="admin-section">
          {/* Header with controls */}
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Analytics Dashboard</h1>
              <p className="admin-subtitle">System Performance • User Behaviour • Integrations</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                aria-label="Time range selector"
                className="admin-select"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'admin-btn admin-btn-success' : 'admin-btn admin-btn-secondary'}
              >
                {autoRefresh ? '🔄 Auto-refresh ON' : '🔄 Auto-refresh OFF'}
              </button>
              <button
                type="button"
                onClick={fetchAllData}
                className="admin-btn admin-btn-primary"
              >
                Refresh Now
              </button>
            </div>
          </div>

          {/* SECTION 1: System Performance */}
          <div className="admin-content-section">
            <h2 className="admin-section-title">
              <span>⚙️</span> System Performance
            </h2>

            <div className="admin-grid">
              {/* Build Performance Monitor */}
              <div className="admin-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="admin-card-title">Build Performance Monitor</h3>
                    <p className="admin-card-subtitle">Latest build metrics and history</p>
                  </div>
                  <div className={`admin-status-indicator ${
                    buildData?.health === 'good' ? 'admin-status-success' :
                    buildData?.health === 'warning' ? 'admin-status-warning' : 'admin-status-error'
                  }`} title={`Build Health: ${buildData?.health}`}></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="admin-stat-box">
                    <p className="admin-stat-label">Duration</p>
                    <p className="admin-stat-value">{buildData?.latest.duration}s</p>
                  </div>
                  <div className="admin-stat-box">
                    <p className="admin-stat-label">Bundle Size</p>
                    <p className="admin-stat-value">{buildData?.latest.bundleSize} MB</p>
                  </div>
                  <div className="admin-stat-box">
                    <p className="admin-stat-label">JS Assets</p>
                    <p className="admin-stat-value">{buildData?.latest.jsAssets}</p>
                  </div>
                  <div className="admin-stat-box">
                    <p className="admin-stat-label">CSS Assets</p>
                    <p className="admin-stat-value">{buildData?.latest.cssAssets}</p>
                  </div>
                </div>

                {/* Mini sparkline for build duration */}
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={buildData?.history}>
                      <Line
                        type="monotone"
                        dataKey="duration"
                        stroke={chartColors.primary}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lighthouse Metrics */}
              <div className="admin-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="admin-card-title">Lighthouse Metrics</h3>
                    <p className="admin-card-subtitle">Core Web Vitals performance</p>
                  </div>
                  <button type="button" className="admin-btn admin-btn-sm admin-btn-primary">
                    Run Audit
                  </button>
                </div>

                <div className="space-y-3">
                  {Object.entries(lighthouseData?.metrics || {}).slice(0, 4).map(([key, metric]) => (
                    <div key={key} className="relative group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-300 uppercase">{key}</span>
                          <div className="hidden group-hover:block absolute z-10 left-12 -top-2 px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded whitespace-nowrap">
                            {metric.description}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {metric.value}{metric.unit}
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${metric.score}%`,
                            backgroundColor: getScoreColor(metric.score)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Latency Graph */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-semibold text-white mb-4">API Latency</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Legend />
                      {apiLatencyData?.endpoints.slice(0, 5).map((endpoint, index) => (
                        <Line
                          key={endpoint.path}
                          data={endpoint.data}
                          type="monotone"
                          dataKey="latency"
                          name={endpoint.path}
                          stroke={Object.values(chartColors)[index]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Error Rate & Exception Tracing */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">Error Rate & Exceptions</h3>
                  <button type="button" className="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
                    View Logs
                  </button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={errorData?.daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Legend />
                      <Bar dataKey="errors4xx" fill={chartColors.warning} name="4xx Errors" />
                      <Bar dataKey="errors5xx" fill={chartColors.error} name="5xx Errors" />
                      <Line
                        type="monotone"
                        dataKey="errors4xx"
                        stroke={chartColors.warning}
                        strokeWidth={2}
                        dot={false}
                        name="4xx Trend"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around mt-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-500">{errorData?.summary.trend['4xx']}%</p>
                    <p className="text-xs text-gray-400">4xx Trend</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{errorData?.summary.trend['5xx']}%</p>
                    <p className="text-xs text-gray-400">5xx Trend</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: User Behaviour */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>👥</span> User Behaviour
            </h2>

            {/* Traffic Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Visitors', value: trafficData?.overview.visitors, change: trafficData?.overview.changes.visitors, icon: '👤' },
                { label: 'Sessions', value: trafficData?.overview.sessions, change: trafficData?.overview.changes.sessions, icon: '🔗' },
                { label: 'Page Views', value: trafficData?.overview.pageViews, change: trafficData?.overview.changes.pageViews, icon: '📄' },
                { label: 'Bounce Rate', value: `${trafficData?.overview.bounceRate}%`, change: trafficData?.overview.changes.bounceRate, icon: '📊' },
                { label: 'Avg. Duration', value: `${Math.floor((trafficData?.overview.avgSessionDuration || 0) / 60)}:${((trafficData?.overview.avgSessionDuration || 0) % 60).toString().padStart(2, '0')}`, change: trafficData?.overview.changes.avgSessionDuration, icon: '⏱️' }
              ].map((metric) => (
                <div key={metric.label} className="bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400 font-medium">{metric.label}</p>
                    <span className="text-2xl">{metric.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </p>
                  {metric.change && (
                    <p className={`text-sm mt-2 ${metric.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Time Series */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-semibold text-white mb-4">Traffic Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData?.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="pageViews" stackId="1" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.6} name="Page Views" />
                      <Area type="monotone" dataKey="sessions" stackId="1" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.6} name="Sessions" />
                      <Area type="monotone" dataKey="visitors" stackId="1" stroke={chartColors.success} fill={chartColors.success} fillOpacity={0.6} name="Visitors" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Geography */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-semibold text-white mb-4">User Geography</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {trafficData?.geography.map((country, index) => (
                    <div key={country.code} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-white">{country.country}</p>
                          <p className="text-sm text-gray-400">{country.sessions.toLocaleString()} sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{country.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Funnel
                        dataKey="value"
                        data={funnelData?.stages || []}
                        isAnimationActive
                      >
                        <LabelList position="center" fill="#fff" fontSize={14} />
                        {funnelData?.stages?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around mt-4 pt-4 border-t border-gray-700">
                  {funnelData?.stages?.map((stage: any) => (
                    <div key={stage.name} className="text-center">
                      <p className="text-sm text-gray-400">{stage.name}</p>
                      <p className="text-lg font-bold text-white">{stage.value.toLocaleString()}</p>
                      {stage.dropoff > 0 && (
                        <p className="text-xs text-red-400">-{stage.dropoff}%</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Integrations & Reliability */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🧩</span> Integrations & Reliability
            </h2>

            {/* Integration Health Status */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Integration Health Status</h3>
                <button
                  type="button"
                  onClick={fetchAllData}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Test All Connections
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Service</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Latency</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Uptime</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Checked</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {integrationData?.services.map((service) => (
                      <tr key={service.name} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{service.name}</td>
                        <td className="py-3 px-4 text-gray-300">{service.type}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            service.status === 'operational' ? 'bg-green-900/50 text-green-400' :
                            service.status === 'degraded' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              service.status === 'operational' ? 'bg-green-400' :
                              service.status === 'degraded' ? 'bg-yellow-400' :
                              'bg-red-400'
                            } animate-pulse`}></span>
                            {service.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {service.latency ? `${service.latency}ms` : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{service.uptime}%</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {new Date(service.lastChecked).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <button type="button" className="text-blue-400 hover:text-blue-300 text-sm">
                            {service.status === 'error' ? 'Reconnect' : 'Test'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resource Usage Charts */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-semibold text-white mb-4">Resource Usage</h3>

                {/* Database Resources */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Database</h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={resourceData?.database.timeSeries.slice(-10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                          labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Line type="monotone" dataKey="cpu" stroke={chartColors.primary} strokeWidth={2} dot={false} name="CPU %" />
                        <Line type="monotone" dataKey="memory" stroke={chartColors.secondary} strokeWidth={2} dot={false} name="Memory %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Storage Breakdown */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Storage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Total Usage</span>
                      <span className="text-sm font-bold text-white">
                        {resourceData?.storage.current.used}GB / {resourceData?.storage.current.total}GB
                      </span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${(resourceData?.storage.current.used! / resourceData?.storage.current.total!) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {resourceData?.storage.breakdown.slice(0, 4).map((item) => (
                        <div key={item.type} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                          <span className="text-xs text-gray-400">{item.type}</span>
                          <span className="text-xs font-bold text-white">{item.size}GB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Uptime History */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="text-lg font-semibold text-white mb-4">System Uptime History</h3>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-400">Current Uptime</span>
                    <span className="text-2xl font-bold text-green-400">{uptimeData?.current.uptime}%</span>
                  </div>

                  {uptimeData?.current.lastDowntime && (
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-sm font-medium text-gray-300">Last Downtime</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(uptimeData.current.lastDowntime.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Duration: {Math.floor(uptimeData.current.lastDowntime.duration / 60)}m {uptimeData.current.lastDowntime.duration % 60}s
                      </p>
                      <p className="text-xs text-gray-400">
                        Cause: {uptimeData.current.lastDowntime.cause}
                      </p>
                    </div>
                  )}
                </div>

                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={uptimeData?.history.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => new Date(value).getDate().toString()}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fontSize: 10 }}
                        domain={[99, 100]}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="uptime"
                        stroke={chartColors.success}
                        fill={chartColors.success}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating notification for auto-refresh */}
        {autoRefresh && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm">Auto-refreshing every 30s</span>
          </div>
        )}
      </AdminLayout>
    </>
  )
}