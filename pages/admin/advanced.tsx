/**
 * Admin Advanced View Page - Rebuilt to match Admin Design System
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

type ComponentType = 'health' | 'errors' | 'api' | 'build' | 'cache' | 'database' | 'migrations' | 'integrity' | 'backup'

export default function AdvancedViewPage() {
  const [activeTab, setActiveTab] = useState<ComponentType>('health')
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
  }, [autoRefresh, activeTab])

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

  const tabs: { id: ComponentType; label: string; icon: string; category: string }[] = [
    { id: 'health', label: 'Server Health', icon: '🔧', category: 'system' },
    { id: 'errors', label: 'Error Logs', icon: '🚨', category: 'system' },
    { id: 'api', label: 'API Monitor', icon: '📡', category: 'system' },
    { id: 'build', label: 'Performance', icon: '⚡', category: 'system' },
    { id: 'cache', label: 'Cache', icon: '💾', category: 'system' },
    { id: 'database', label: 'Database', icon: '🗄️', category: 'database' },
    { id: 'migrations', label: 'Migrations', icon: '📝', category: 'database' },
    { id: 'integrity', label: 'Integrity', icon: '✅', category: 'database' },
    { id: 'backup', label: 'Backup', icon: '💿', category: 'database' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'health': // Server Health Monitor
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)',
                background: 'linear-gradient(135deg, #D1FAE5 0%, var(--admin-card-bg) 100%)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏱️</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                  {systemHealth?.uptime}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                  99.99% availability
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)',
                background: 'linear-gradient(135deg, #DBEAFE 0%, var(--admin-card-bg) 100%)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌐</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                  {systemHealth?.network.latency}ms
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                  Latency {systemHealth?.network.status}
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)',
                background: 'linear-gradient(135deg, #E0E7FF 0%, var(--admin-card-bg) 100%)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                  Valid
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                  Expires in {systemHealth?.domain.expiry}
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)',
                background: 'linear-gradient(135deg, #FEF3C7 0%, var(--admin-card-bg) 100%)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌍</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                  Active
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>
                  All services operational
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: 'var(--admin-shadow-light)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.5rem' }}>
                Resource Usage
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>CPU Usage</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>{systemHealth?.server.cpu}%</span>
                  </div>
                  <div style={{ width: '100%', height: '0.75rem', borderRadius: '9999px', backgroundColor: 'var(--admin-border)' }}>
                    <div style={{ width: `${systemHealth?.server.cpu}%`, height: '0.75rem', borderRadius: '9999px', backgroundColor: '#3B82F6', transition: 'width 0.3s' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>Memory</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>{systemHealth?.server.memory}%</span>
                  </div>
                  <div style={{ width: '100%', height: '0.75rem', borderRadius: '9999px', backgroundColor: 'var(--admin-border)' }}>
                    <div style={{ width: `${systemHealth?.server.memory}%`, height: '0.75rem', borderRadius: '9999px', backgroundColor: '#8B5CF6', transition: 'width 0.3s' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>Disk Space</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>{systemHealth?.server.disk}%</span>
                  </div>
                  <div style={{ width: '100%', height: '0.75rem', borderRadius: '9999px', backgroundColor: 'var(--admin-border)' }}>
                    <div style={{ width: `${systemHealth?.server.disk}%`, height: '0.75rem', borderRadius: '9999px', backgroundColor: '#10B981', transition: 'width 0.3s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'errors': // Error Log Viewer
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626'
                }}>
                  Errors ({errors.filter(e => e.severity === 'error').length})
                </span>
                <span style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: '#FEF3C7',
                  color: '#D97706'
                }}>
                  Warnings ({errors.filter(e => e.severity === 'warning').length})
                </span>
                <span style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: '#DBEAFE',
                  color: '#2563EB'
                }}>
                  Info ({errors.filter(e => e.severity === 'info').length})
                </span>
              </div>
              <button
                type="button"
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
                Clear Logs
              </button>
            </div>

            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              overflow: 'hidden',
              boxShadow: 'var(--admin-shadow-light)'
            }}>
              {errors.map((error, index) => (
                <div key={error.id} style={{
                  padding: '1rem 1.5rem',
                  borderBottom: index < errors.length - 1 ? '1px solid var(--admin-border)' : 'none',
                  borderLeft: `4px solid ${
                    error.severity === 'error' ? '#EF4444' :
                    error.severity === 'warning' ? '#F59E0B' : '#3B82F6'
                  }`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: error.type === 'frontend' ? '#DBEAFE' : error.type === 'backend' ? '#FEF3C7' : '#D1FAE5',
                          color: error.type === 'frontend' ? '#2563EB' : error.type === 'backend' ? '#D97706' : '#059669'
                        }}>
                          {error.type}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{error.timestamp}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', margin: '0 0 0.25rem 0' }}>
                        {error.message}
                      </p>
                      {error.stack && (
                        <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--admin-text-secondary)', margin: 0 }}>
                          {error.stack}
                        </p>
                      )}
                    </div>
                    <button style={{ color: 'var(--admin-text-secondary)', cursor: 'pointer', background: 'none', border: 'none', padding: '0.25rem' }}>
                      <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'api': // API Request Monitor
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>Total Requests</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>1,234</p>
                <p style={{ fontSize: '0.75rem', color: '#10B981' }}>+12% from yesterday</p>
              </div>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>Avg Response Time</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>145ms</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>Optimal performance</p>
              </div>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>Error Rate</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#EF4444', marginBottom: '0.25rem' }}>0.3%</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>4 failed requests</p>
              </div>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' }}>Cache Hit Rate</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10B981', marginBottom: '0.25rem' }}>92%</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>Excellent</p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: 'var(--admin-shadow-light)',
              overflowX: 'auto'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1rem' }}>
                Recent API Requests
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Method</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Endpoint</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Duration</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {apiRequests.map((request) => (
                    <tr key={request.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: request.method === 'GET' ? '#DBEAFE' : request.method === 'POST' ? '#D1FAE5' : request.method === 'DELETE' ? '#FEE2E2' : '#F3F4F6',
                          color: request.method === 'GET' ? '#2563EB' : request.method === 'POST' ? '#059669' : request.method === 'DELETE' ? '#DC2626' : '#6B7280'
                        }}>
                          {request.method}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>{request.endpoint}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: request.status >= 200 && request.status < 300 ? '#10B981' : request.status >= 400 ? '#EF4444' : '#F59E0B'
                        }}>
                          {request.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>{request.duration}ms</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>{request.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'build': // Build Performance
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: 'var(--admin-shadow-light)',
              background: 'linear-gradient(135deg, var(--admin-card-bg) 0%, rgba(99, 102, 241, 0.1) 100%)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.5rem' }}>
                Lighthouse Metrics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '5rem', height: '5rem', margin: '0 auto 0.75rem', borderRadius: '50%', border: '4px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10B981' }}>98</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>Performance</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '5rem', height: '5rem', margin: '0 auto 0.75rem', borderRadius: '50%', border: '4px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10B981' }}>100</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>Accessibility</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '5rem', height: '5rem', margin: '0 auto 0.75rem', borderRadius: '50%', border: '4px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#F59E0B' }}>92</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>Best Practices</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '5rem', height: '5rem', margin: '0 auto 0.75rem', borderRadius: '50%', border: '4px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10B981' }}>95</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)' }}>SEO</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                  Bundle Size
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Main Bundle</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>234 KB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Vendor Bundle</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>512 KB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>CSS Bundle</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>87 KB</span>
                  </div>
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500, color: 'var(--admin-text-primary)' }}>Total Size</span>
                      <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>833 KB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                  Load Times
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>First Contentful Paint</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10B981' }}>0.8s</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Time to Interactive</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10B981' }}>1.2s</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Speed Index</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10B981' }}>1.1s</span>
                  </div>
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500, color: 'var(--admin-text-primary)' }}>Overall Score</span>
                      <span style={{ fontWeight: 600, color: '#10B981' }}>Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'cache': // Cache Manager
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>CDN Cache</h3>
                  <span style={{ fontSize: '1.5rem' }}>☁️</span>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>2.3 GB</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '1rem' }}>87% hit rate</p>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    height: '2.25rem',
                    padding: '0 1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Purge CDN Cache
                </button>
              </div>

              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>Redis Cache</h3>
                  <span style={{ fontSize: '1.5rem' }}>💾</span>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>456 MB</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '1rem' }}>92% hit rate</p>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    height: '2.25rem',
                    padding: '0 1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    backgroundColor: '#F59E0B',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Clear Redis
                </button>
              </div>

              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>Browser Cache</h3>
                  <span style={{ fontSize: '1.5rem' }}>🌐</span>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>Active</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '1rem' }}>Max-age: 3600s</p>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    height: '2.25rem',
                    padding: '0 1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    backgroundColor: 'var(--admin-accent)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Update Headers
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: 'var(--admin-shadow-light)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                Cache by Route
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { route: '/', size: '234 KB', hits: '12,345', rate: '94%' },
                  { route: '/cases', size: '567 KB', hits: '8,901', rate: '89%' },
                  { route: '/api/admin/*', size: '123 KB', hits: '5,678', rate: '78%' },
                  { route: '/static/*', size: '890 KB', hits: '45,678', rate: '99%' }
                ].map(cache => (
                  <div key={cache.route} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--admin-bg)', borderRadius: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                        {cache.route}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', margin: 0 }}>
                        Size: {cache.size} | Hits: {cache.hits}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10B981', marginBottom: '0.25rem' }}>{cache.rate}</p>
                      <button style={{ fontSize: '0.75rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'database': // Database Inspector
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: 'var(--admin-shadow-light)',
              overflowX: 'auto'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                Database Tables
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Table Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Rows</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Size</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Last Modified</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'cases', rows: 128, size: '45 MB', modified: '2 hours ago' },
                    { name: 'statements', rows: 1942, size: '234 MB', modified: '10 min ago' },
                    { name: 'people', rows: 304, size: '12 MB', modified: '1 hour ago' },
                    { name: 'organizations', rows: 71, size: '3 MB', modified: '3 days ago' },
                    { name: 'users', rows: 23, size: '1 MB', modified: '5 min ago' }
                  ].map(table => (
                    <tr key={table.name} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>{table.name}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>{table.rows.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>{table.size}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>{table.modified}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          View Schema
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                  Database Stats
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Total Size</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>295 MB</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Total Tables</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>12</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Total Indexes</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>34</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)' }}>Connections</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>23 / 100</span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                  Recent Queries
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { query: 'SELECT * FROM cases WHERE status = ?', time: '12ms' },
                    { query: 'INSERT INTO statements...', time: '45ms' },
                    { query: 'UPDATE people SET...', time: '8ms' }
                  ].map((q, i) => (
                    <div key={i} style={{ padding: '0.75rem', backgroundColor: 'var(--admin-bg)', borderRadius: '0.5rem' }}>
                      <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--admin-text-primary)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.query}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', margin: 0 }}>Execution time: {q.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'migrations': // Migration Tracker
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: 'var(--admin-shadow-light)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                Migration History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { id: '20241015_add_topics_table', status: 'applied', date: '2024-10-15 10:30:00' },
                  { id: '20241010_add_indexes', status: 'applied', date: '2024-10-10 14:22:00' },
                  { id: '20241005_update_schema', status: 'applied', date: '2024-10-05 09:15:00' },
                  { id: '20241001_initial_migration', status: 'applied', date: '2024-10-01 08:00:00' }
                ].map(migration => (
                  <div key={migration.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--admin-bg)', borderRadius: '0.75rem' }}>
                    <div>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                        {migration.id}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', margin: 0 }}>{migration.date}</p>
                    </div>
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      backgroundColor: '#D1FAE5',
                      color: '#059669'
                    }}>
                      {migration.status}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--admin-border)' }}>
                <button
                  type="button"
                  style={{
                    height: '2.25rem',
                    padding: '0 1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    backgroundColor: 'var(--admin-accent)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Run Pending Migrations
                </button>
              </div>
            </div>
          </div>
        )

      case 'integrity': // Data Integrity Checker
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)',
                background: 'linear-gradient(135deg, var(--admin-card-bg) 0%, rgba(16, 185, 129, 0.1) 100%)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#10B981', marginBottom: '0.75rem' }}>Valid Records</h3>
                <p style={{ fontSize: '2rem', fontWeight: 600, color: '#10B981', marginBottom: '0.25rem' }}>2,468</p>
                <p style={{ fontSize: '0.875rem', color: '#059669' }}>All checks passed</p>
              </div>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)',
                background: 'linear-gradient(135deg, var(--admin-card-bg) 0%, rgba(245, 158, 11, 0.1) 100%)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#F59E0B', marginBottom: '0.75rem' }}>Warnings</h3>
                <p style={{ fontSize: '2rem', fontWeight: 600, color: '#F59E0B', marginBottom: '0.25rem' }}>12</p>
                <p style={{ fontSize: '0.875rem', color: '#D97706' }}>Review recommended</p>
              </div>
              <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-light)',
                background: 'linear-gradient(135deg, var(--admin-card-bg) 0%, rgba(239, 68, 68, 0.1) 100%)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#EF4444', marginBottom: '0.75rem' }}>Issues Found</h3>
                <p style={{ fontSize: '2rem', fontWeight: 600, color: '#EF4444', marginBottom: '0.25rem' }}>3</p>
                <p style={{ fontSize: '0.875rem', color: '#DC2626' }}>Action required</p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: 'var(--admin-shadow-light)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                Integrity Issues
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                    <span style={{ color: '#EF4444', marginTop: '0.25rem' }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#EF4444', marginBottom: '0.5rem' }}>
                        Orphaned Statement Records
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#DC2626', marginBottom: '0.5rem' }}>
                        Found 2 statements with no associated person or organization
                      </p>
                      <button style={{ fontSize: '0.875rem', color: '#EF4444', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                        Fix Issue →
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                    <span style={{ color: '#F59E0B', marginTop: '0.25rem' }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#F59E0B', marginBottom: '0.5rem' }}>
                        Missing Source References
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#D97706', marginBottom: '0.5rem' }}>
                        12 cases have incomplete source citations
                      </p>
                      <button style={{ fontSize: '0.875rem', color: '#F59E0B', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                        Review →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--admin-border)' }}>
                <button
                  type="button"
                  style={{
                    height: '2.25rem',
                    padding: '0 1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    backgroundColor: 'var(--admin-accent)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Run Full Integrity Check
                </button>
              </div>
            </div>
          </div>
        )

      case 'backup': // Backup & Restore
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: 'var(--admin-shadow-light)',
              background: 'linear-gradient(135deg, var(--admin-card-bg) 0%, rgba(59, 130, 246, 0.1) 100%)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                Latest Backup
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Last Backup</p>
                  <p style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>2024-10-15 02:00:00</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Size</p>
                  <p style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>295 MB</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary)', marginBottom: '0.25rem' }}>Status</p>
                  <p style={{ fontWeight: 600, color: '#10B981' }}>Successful</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{
                    height: '2.25rem',
                    padding: '0 1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    backgroundColor: 'var(--admin-accent)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Create Backup Now
                </button>
                <button
                  type="button"
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
                  Download Latest
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--admin-card-bg)',
              border: '1px solid var(--admin-border)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: 'var(--admin-shadow-light)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text-primary)', marginBottom: '1.25rem' }}>
                Backup History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { date: '2024-10-15 02:00:00', size: '295 MB', type: 'Automatic', status: 'success' },
                  { date: '2024-10-14 02:00:00', size: '294 MB', type: 'Automatic', status: 'success' },
                  { date: '2024-10-13 14:30:00', size: '293 MB', type: 'Manual', status: 'success' },
                  { date: '2024-10-13 02:00:00', size: '293 MB', type: 'Automatic', status: 'success' }
                ].map((backup, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--admin-bg)', borderRadius: '0.75rem' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                        {backup.date}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)', margin: 0 }}>
                        {backup.type} • {backup.size}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '0.5rem',
                        height: '0.5rem',
                        borderRadius: '50%',
                        backgroundColor: backup.status === 'success' ? '#10B981' : '#EF4444'
                      }}></span>
                      <button style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Restore
                      </button>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
          <div style={{ width: '3rem', height: '3rem', border: '4px solid #e5e7eb', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Advanced View - TWR Admin</title>
      </Head>

      <AdminLayout title="">
        {/* Break out of AdminLayout's padding */}
        <div style={{ margin: '-2rem', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
          {/* Sticky Header with Toolbar */}
          <div style={{
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
                    Advanced View
                  </h1>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--admin-text-secondary)',
                    margin: 0
                  }}>
                    System monitoring and management tools
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--admin-text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Auto-refresh (5s)
                  </label>
                  <button
                    type="button"
                    onClick={fetchData}
                    style={{
                      height: '2.25rem',
                      padding: '0 1rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      backgroundColor: 'var(--admin-accent)',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Refresh Now
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
                    <span style={{ fontSize: '1.125rem' }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
            {renderContent()}
          </div>
        </div>

        {/* CSS for responsive and animations */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
