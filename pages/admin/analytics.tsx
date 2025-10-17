/**
 * Admin Analytics Page - Comprehensive System Monitoring Dashboard
 * Fully aligned with Admin Design System used in /admin/apps/
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5rem 0',
          minHeight: '50vh'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid var(--admin-border)',
            borderTop: '4px solid var(--admin-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </AdminLayout>
    )
  }

  // Colors for charts matching design system
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
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--admin-bg)' }}>
          {/* Sticky Header with Action Buttons */}
          <div style={{
            backgroundColor: 'var(--admin-card-bg)',
            borderBottom: '1px solid var(--admin-border)',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--admin-text-primary)',
                    marginBottom: '0.25rem'
                  }}>
                    Analytics Dashboard
                  </h1>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--admin-text-secondary)',
                    margin: 0
                  }}>
                    {timeRange === '24h' ? 'Last 24 hours' : timeRange === '7d' ? 'Last 7 days' : 'Last 30 days'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    style={{
                      padding: '0.625rem 1.25rem',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--admin-border)',
                      backgroundColor: 'var(--admin-card-bg)',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`admin-btn ${autoRefresh ? 'admin-btn-success' : 'admin-btn-secondary'}`}
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={fetchAllData}
                    className="admin-btn admin-btn-primary"
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>

            {/* SECTION 1: System Performance */}
            <div className="admin-section">
              <h2 className="admin-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚙️</span> System Performance
              </h2>

              <div className="admin-grid admin-grid-cols-2" style={{ marginBottom: '1.5rem' }}>
                {/* Build Performance Monitor */}
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: 'var(--admin-text-primary)',
                        marginBottom: '0.25rem'
                      }}>
                        Build Performance Monitor
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--admin-text-secondary)',
                        margin: 0
                      }}>
                        Latest build metrics and history
                      </p>
                    </div>
                    <span style={{
                      width: '0.75rem',
                      height: '0.75rem',
                      borderRadius: '50%',
                      backgroundColor: buildData?.health === 'good' ? '#10B981' :
                        buildData?.health === 'warning' ? '#F59E0B' : '#EF4444',
                      display: 'inline-block',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}></span>
                  </div>

                  <div className="admin-grid admin-grid-cols-2" style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--admin-bg)',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--admin-border)'
                    }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Duration</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text-primary)', margin: 0 }}>{buildData?.latest.duration}s</p>
                    </div>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--admin-bg)',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--admin-border)'
                    }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Bundle Size</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text-primary)', margin: 0 }}>{buildData?.latest.bundleSize} MB</p>
                    </div>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--admin-bg)',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--admin-border)'
                    }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>JS Assets</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text-primary)', margin: 0 }}>{buildData?.latest.jsAssets}</p>
                    </div>
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--admin-bg)',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--admin-border)'
                    }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>CSS Assets</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text-primary)', margin: 0 }}>{buildData?.latest.cssAssets}</p>
                    </div>
                  </div>

                  {/* Mini sparkline for build duration */}
                  <div style={{ height: '5rem' }}>
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
                          contentStyle={{
                            backgroundColor: 'var(--admin-card-bg)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem',
                            boxShadow: 'var(--admin-shadow-medium)'
                          }}
                          labelStyle={{ color: 'var(--admin-text-secondary)' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Lighthouse Metrics */}
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: 'var(--admin-text-primary)',
                        marginBottom: '0.25rem'
                      }}>
                        Lighthouse Metrics
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--admin-text-secondary)',
                        margin: 0
                      }}>
                        Core Web Vitals performance
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Run Audit
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(lighthouseData?.metrics || {}).slice(0, 4).map(([key, metric]) => (
                      <div key={key} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'var(--admin-text-primary)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {key}
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              color: 'var(--admin-text-secondary)'
                            }}>
                              {metric.description}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: 'var(--admin-text-primary)'
                          }}>
                            {metric.value}{metric.unit}
                          </span>
                        </div>
                        <div style={{
                          height: '0.5rem',
                          backgroundColor: 'var(--admin-border)',
                          borderRadius: '9999px',
                          overflow: 'hidden'
                        }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${metric.score}%`,
                              backgroundColor: getScoreColor(metric.score),
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Latency Graph */}
                <div className="admin-card">
                  <h3 className="admin-section-header" style={{ marginBottom: '1rem' }}>API Latency</h3>
                  <div style={{ height: '16rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                        <XAxis
                          dataKey="timestamp"
                          stroke="var(--admin-text-secondary)"
                          style={{ fontSize: '0.75rem' }}
                        />
                        <YAxis
                          stroke="var(--admin-text-secondary)"
                          style={{ fontSize: '0.75rem' }}
                          label={{
                            value: 'Latency (ms)',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: 'var(--admin-text-secondary)', fontSize: '0.75rem' }
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--admin-card-bg)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem'
                          }}
                          labelStyle={{ color: 'var(--admin-text-secondary)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
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
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="admin-section-header" style={{ margin: 0 }}>Error Rate & Exceptions</h3>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      View Logs
                    </button>
                  </div>
                  <div style={{ height: '16rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={errorData?.daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                        <XAxis
                          dataKey="date"
                          stroke="var(--admin-text-secondary)"
                          style={{ fontSize: '0.75rem' }}
                        />
                        <YAxis
                          stroke="var(--admin-text-secondary)"
                          style={{ fontSize: '0.75rem' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--admin-card-bg)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem'
                          }}
                          labelStyle={{ color: 'var(--admin-text-secondary)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
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
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--admin-border)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: chartColors.warning, margin: 0 }}>{errorData?.summary.trend['4xx']}%</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: '0.25rem' }}>4xx Trend</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: chartColors.error, margin: 0 }}>{errorData?.summary.trend['5xx']}%</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginTop: '0.25rem' }}>5xx Trend</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: User Behaviour */}
            <div className="admin-section" style={{ marginTop: '1.5rem' }}>
              <h2 className="admin-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👥</span> User Behaviour
              </h2>

              {/* Traffic Overview Metric Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {[
                  { label: 'Visitors', value: trafficData?.overview.visitors, change: trafficData?.overview.changes.visitors, icon: '👤', color: chartColors.primary },
                  { label: 'Sessions', value: trafficData?.overview.sessions, change: trafficData?.overview.changes.sessions, icon: '🔗', color: chartColors.secondary },
                  { label: 'Page Views', value: trafficData?.overview.pageViews, change: trafficData?.overview.changes.pageViews, icon: '📄', color: chartColors.info },
                  { label: 'Bounce Rate', value: `${trafficData?.overview.bounceRate}%`, change: trafficData?.overview.changes.bounceRate, icon: '📊', color: chartColors.warning },
                  { label: 'Avg. Duration', value: `${Math.floor((trafficData?.overview.avgSessionDuration || 0) / 60)}:${((trafficData?.overview.avgSessionDuration || 0) % 60).toString().padStart(2, '0')}`, change: trafficData?.overview.changes.avgSessionDuration, icon: '⏱️', color: chartColors.success }
                ].map((metric) => (
                  <div key={metric.label} className="admin-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      fontSize: '3rem',
                      opacity: 0.1,
                      lineHeight: 1
                    }}>
                      {metric.icon}
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <p style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--admin-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.5rem'
                      }}>
                        {metric.label}
                      </p>
                      <p style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: 'var(--admin-text-primary)',
                        margin: 0,
                        fontVariantNumeric: 'tabular-nums'
                      }}>
                        {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                      </p>
                      {metric.change !== undefined && metric.change !== null && (
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          marginTop: '0.5rem',
                          color: metric.change > 0 ? chartColors.success : chartColors.error,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-grid admin-grid-cols-2">
                {/* Traffic Time Series */}
                <div className="admin-card">
                  <h3 className="admin-section-header" style={{ marginBottom: '1rem' }}>Traffic Overview</h3>
                  <div style={{ height: '16rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trafficData?.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                        <XAxis
                          dataKey="timestamp"
                          stroke="var(--admin-text-secondary)"
                          style={{ fontSize: '0.75rem' }}
                        />
                        <YAxis
                          stroke="var(--admin-text-secondary)"
                          style={{ fontSize: '0.75rem' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--admin-card-bg)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem'
                          }}
                          labelStyle={{ color: 'var(--admin-text-secondary)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        <Area type="monotone" dataKey="pageViews" stackId="1" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.6} name="Page Views" />
                        <Area type="monotone" dataKey="sessions" stackId="1" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.6} name="Sessions" />
                        <Area type="monotone" dataKey="visitors" stackId="1" stroke={chartColors.success} fill={chartColors.success} fillOpacity={0.6} name="Visitors" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* User Geography */}
                <div className="admin-card">
                  <h3 className="admin-section-header" style={{ marginBottom: '1rem' }}>User Geography</h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxHeight: '16rem',
                    overflowY: 'auto'
                  }}>
                    {trafficData?.geography.map((country, index) => (
                      <div
                        key={country.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          backgroundColor: 'var(--admin-bg)',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--admin-border)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'var(--admin-text-secondary)',
                            minWidth: '1.5rem'
                          }}>
                            #{index + 1}
                          </span>
                          <div>
                            <p style={{
                              fontWeight: 600,
                              color: 'var(--admin-text-primary)',
                              margin: 0,
                              fontSize: '0.875rem'
                            }}>
                              {country.country}
                            </p>
                            <p style={{
                              fontSize: '0.75rem',
                              color: 'var(--admin-text-secondary)',
                              margin: 0
                            }}>
                              {country.sessions.toLocaleString()} sessions
                            </p>
                          </div>
                        </div>
                        <div style={{
                          fontWeight: 700,
                          color: 'var(--admin-text-primary)',
                          fontSize: '1rem'
                        }}>
                          {country.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Integrations & Reliability */}
            <div className="admin-section" style={{ marginTop: '1.5rem' }}>
              <h2 className="admin-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🧩</span> Integrations & Reliability
              </h2>

              {/* Integration Health Status - Styled like Apps */}
              <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--admin-text-primary)',
                    margin: 0
                  }}>
                    Integration Health Status
                  </h3>
                  <button
                    type="button"
                    onClick={fetchAllData}
                    className="admin-btn admin-btn-primary"
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test All Connections
                  </button>
                </div>

                {/* Integration Cards matching Apps design */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {integrationData?.services.map((service) => (
                    <div
                      key={service.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: 'var(--admin-bg)',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--admin-border)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '0.5rem',
                          backgroundColor: 'var(--admin-card-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          fontWeight: 700
                        }}>
                          {service.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontWeight: 600,
                            color: 'var(--admin-text-primary)',
                            margin: 0,
                            fontSize: '0.875rem'
                          }}>
                            {service.name}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--admin-text-secondary)',
                            margin: 0
                          }}>
                            {service.type}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <span className={`admin-badge ${
                            service.status === 'operational' ? 'admin-badge-success' :
                            service.status === 'degraded' ? 'admin-badge-warning' :
                            'admin-badge-error'
                          }`}>
                            {service.status}
                          </span>
                        </div>

                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--admin-text-primary)',
                            margin: 0
                          }}>
                            {service.latency ? `${service.latency}ms` : '-'}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--admin-text-secondary)',
                            margin: 0
                          }}>
                            Latency
                          </p>
                        </div>

                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--admin-text-primary)',
                            margin: 0
                          }}>
                            {service.uptime}%
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--admin-text-secondary)',
                            margin: 0
                          }}>
                            Uptime
                          </p>
                        </div>

                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary"
                          style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          {service.status === 'error' ? 'Reconnect' : 'Test'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-grid admin-grid-cols-2">
                {/* Resource Usage */}
                <div className="admin-card">
                  <h3 className="admin-section-header" style={{ marginBottom: '1rem' }}>Resource Usage</h3>

                  {/* Database Resources */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--admin-text-secondary)',
                      marginBottom: '0.75rem'
                    }}>
                      Database
                    </h4>
                    <div style={{ height: '8rem' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={resourceData?.database.timeSeries.slice(-10)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                          <XAxis dataKey="timestamp" hide />
                          <YAxis stroke="var(--admin-text-secondary)" style={{ fontSize: '0.625rem' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--admin-card-bg)',
                              border: '1px solid var(--admin-border)',
                              borderRadius: '0.5rem'
                            }}
                            labelStyle={{ color: 'var(--admin-text-secondary)' }}
                          />
                          <Line type="monotone" dataKey="cpu" stroke={chartColors.primary} strokeWidth={2} dot={false} name="CPU %" />
                          <Line type="monotone" dataKey="memory" stroke={chartColors.secondary} strokeWidth={2} dot={false} name="Memory %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Storage Progress Bars */}
                  <div>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--admin-text-secondary)',
                      marginBottom: '0.75rem'
                    }}>
                      Storage
                    </h4>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>Total Usage</span>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--admin-text-primary)'
                      }}>
                        {resourceData?.storage.current.used}GB / {resourceData?.storage.current.total}GB
                      </span>
                    </div>
                    <div style={{
                      height: '0.75rem',
                      backgroundColor: 'var(--admin-border)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, ${chartColors.primary}, ${chartColors.secondary})`,
                          width: `${(resourceData?.storage.current.used! / resourceData?.storage.current.total!) * 100}%`,
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>

                    <div className="admin-grid admin-grid-cols-2" style={{ gap: '0.5rem' }}>
                      {resourceData?.storage.breakdown.slice(0, 4).map((item) => (
                        <div
                          key={item.type}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem',
                            backgroundColor: 'var(--admin-bg)',
                            borderRadius: '0.5rem'
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{item.type}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>{item.size}GB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Uptime History */}
                <div className="admin-card">
                  <h3 className="admin-section-header" style={{ marginBottom: '1rem' }}>System Uptime History</h3>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Current Uptime</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: chartColors.success }}>{uptimeData?.current.uptime}%</span>
                    </div>

                    {uptimeData?.current.lastDowntime && (
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--admin-bg)',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--admin-border)'
                      }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                          Last Downtime
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>
                          {new Date(uptimeData.current.lastDowntime.date).toLocaleDateString()}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>
                          Duration: {Math.floor(uptimeData.current.lastDowntime.duration / 60)}m {uptimeData.current.lastDowntime.duration % 60}s
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                          Cause: {uptimeData.current.lastDowntime.cause}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ height: '10rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={uptimeData?.history.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                        <XAxis
                          dataKey="date"
                          stroke="var(--admin-text-secondary)"
                          style={{ fontSize: '0.625rem' }}
                          tickFormatter={(value) => new Date(value).getDate().toString()}
                        />
                        <YAxis
                          stroke="var(--admin-text-secondary)"
                          style={{ fontSize: '0.625rem' }}
                          domain={[99, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--admin-card-bg)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem'
                          }}
                          labelStyle={{ color: 'var(--admin-text-secondary)' }}
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
        </div>

        {/* Floating notification for auto-refresh */}
        {autoRefresh && (
          <div style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            backgroundColor: chartColors.success,
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            boxShadow: 'var(--admin-shadow-medium)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 100
          }}>
            <div style={{
              width: '0.5rem',
              height: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '50%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Auto-refreshing every 30s</span>
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
