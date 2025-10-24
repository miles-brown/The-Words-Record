/**
 * Admin Security Page - Security Center Dashboard
 * Fully aligned with Admin Design System used in /admin/apps/ and /admin/analytics/
 * Monitors security events, displays security metrics, and manages access controls
 */

import { useState, useEffect } from 'react'
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

interface AccessControlUser {
  id: string
  username: string
  role: string
  lastLogin: string
  status: 'active' | 'inactive' | 'suspended'
}

interface SecurityMetrics {
  activeSessions: number
  failedLogins24h: number
  mfaEnabledPercent: number
  apiKeys: number
}

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeSessions: 0,
    failedLogins24h: 0,
    mfaEnabledPercent: 0,
    apiKeys: 0
  })
  const [settings, setSettings] = useState<SecuritySettings>({
    mfaRequired: true,
    sessionTimeout: 30,
    passwordComplexity: 'high',
    ipWhitelist: false,
    apiRateLimit: 1000,
    dataEncryption: true
  })
  const [accessControlUsers, setAccessControlUsers] = useState<AccessControlUser[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const [securityScore, setSecurityScore] = useState(85)
  const [showAuditModal, setShowAuditModal] = useState(false)

  useEffect(() => {
    fetchSecurityData()
  }, [timeRange])

  const fetchSecurityData = async () => {
    try {
      setLoading(true)

      // Fetch real data from API endpoints
      const [eventsRes, metricsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/security/events?timeRange=${timeRange}&limit=20`, {
          credentials: 'include'
        }),
        fetch('/api/admin/security/metrics', {
          credentials: 'include'
        }),
        fetch('/api/admin/users?limit=10&orderBy=lastLogin', {
          credentials: 'include'
        }).catch(() => null) // Optional: users list
      ])

      if (!eventsRes.ok || !metricsRes.ok) {
        throw new Error('Failed to fetch security data')
      }

      const eventsData = await eventsRes.json()
      const metricsData = await metricsRes.json()

      setEvents(eventsData.events || [])
      setMetrics(metricsData)

      // Optionally fetch users for access control table
      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json()
        if (usersData.users) {
          setAccessControlUsers(usersData.users.map((u: any) => ({
            id: u.id,
            username: u.username || u.email,
            role: u.role,
            lastLogin: u.lastLogin ? formatUserLastLogin(new Date(u.lastLogin)) : 'Never',
            status: u.isActive ? 'active' : 'inactive'
          })))
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch security data:', error)
      setLoading(false)
    }
  }

  const formatUserLastLogin = (date: Date): string => {
    const now = Date.now()
    const diff = now - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) return `${minutes} mins ago`
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  const handleRunAudit = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/security/audit', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Audit failed')
      }

      const auditReport = await response.json()

      // Update security score based on audit results
      setSecurityScore(auditReport.overallScore)

      // Store audit report for display in modal
      sessionStorage.setItem('lastAuditReport', JSON.stringify(auditReport))

      // Show results in modal
      setShowAuditModal(true)

    } catch (error) {
      console.error('Failed to run security audit:', error)
      alert('Failed to run security audit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = () => {
    if (securityScore >= 90) return '#10B981' // green
    if (securityScore >= 70) return '#F59E0B' // yellow
    return '#EF4444' // red
  }

  const getScoreStatus = () => {
    if (securityScore >= 90) return 'Excellent – System is secure'
    if (securityScore >= 70) return 'Good – Some improvements recommended'
    return 'Critical – Immediate action required'
  }

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return '✓'
      case 'failed_login':
        return '✕'
      case 'permission_change':
        return '⚡'
      case 'data_export':
        return '↓'
      case 'suspicious':
        return '⚠'
      default:
        return '•'
    }
  }

  const getEventColor = (risk: SecurityEvent['risk']) => {
    switch (risk) {
      case 'high':
        return '#EF4444'
      case 'medium':
        return '#F59E0B'
      case 'low':
        return '#10B981'
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Security Center">
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

  return (
    <>
      <Head>
        <title>Security Center - TWR Admin</title>
      </Head>

      <AdminLayout title="Security Center">
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--admin-bg)' }}>
          {/* Subheader with Time Range and Refresh - No longer sticky */}
          <div style={{
            backgroundColor: 'var(--admin-card-bg)',
            borderBottom: '1px solid var(--admin-border)',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--admin-text-secondary)',
                margin: 0
              }}>
                Monitor security events and manage access controls
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--admin-text-primary)',
                    backgroundColor: 'var(--admin-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>

                <button
                  onClick={fetchSecurityData}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'white',
                    backgroundColor: 'var(--admin-accent)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <span style={{ fontSize: '1rem' }}>🔄</span>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {/* Security Score Overview */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2rem',
                backgroundColor: 'var(--admin-card-bg)',
                borderRadius: '0.75rem',
                border: '1px solid var(--admin-border)',
                boxShadow: 'var(--admin-shadow-medium)',
                flexWrap: 'wrap',
                gap: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                  {/* Circular Progress Gauge */}
                  <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                      {/* Background circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="var(--admin-border)"
                        strokeWidth="12"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke={getScoreColor()}
                        strokeWidth="12"
                        strokeDasharray={`${(securityScore / 100) * 326.73} 326.73`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: getScoreColor()
                      }}>
                        {securityScore}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--admin-text-secondary)'
                      }}>
                        /100
                      </div>
                    </div>
                  </div>

                  {/* Score Details */}
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--admin-text-primary)',
                      marginBottom: '0.5rem'
                    }}>
                      Security Score
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--admin-text-secondary)',
                      margin: 0
                    }}>
                      {getScoreStatus()}
                    </p>
                  </div>
                </div>

                {/* Run Audit Button */}
                <button
                  onClick={handleRunAudit}
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    backgroundColor: 'var(--admin-accent)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <span>🔍</span>
                  Run Security Audit
                </button>
              </div>
            </div>

            {/* Quick Security Metrics - Real Data */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {[
                { label: 'Active Sessions', value: metrics.activeSessions.toString(), icon: '🧑‍💻', color: '#3B82F6', description: 'Currently logged in' },
                { label: 'Failed Logins (24h)', value: metrics.failedLogins24h.toString(), icon: '⚠', color: '#F59E0B', description: 'Requires attention' },
                { label: 'MFA Enabled', value: `${metrics.mfaEnabledPercent}%`, icon: '🔐', color: '#10B981', description: 'Two-factor auth' },
                { label: 'API Keys', value: metrics.apiKeys.toString(), icon: '🔑', color: '#8B5CF6', description: 'Active tokens' }
              ].map((metric, index) => (
                <div
                  key={index}
                  title={`Real-time ${metric.label} metric`}
                  style={{
                    position: 'relative',
                    padding: '1.2rem',
                    backgroundColor: 'var(--admin-card-bg)',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--admin-shadow-medium)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'var(--admin-shadow-medium)'
                  }}
                >

                  {/* Background Icon */}
                  <div style={{
                    position: 'absolute',
                    top: '-0.5rem',
                    right: '-0.5rem',
                    fontSize: '3.2rem',
                    opacity: 0.05,
                    lineHeight: 1
                  }}>
                    {metric.icon}
                  </div>

                  {/* Icon Badge */}
                  <div style={{
                    width: '2.4rem',
                    height: '2.4rem',
                    borderRadius: '0.5rem',
                    backgroundColor: `${metric.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    marginBottom: '0.8rem'
                  }}>
                    {metric.icon}
                  </div>

                  {/* Content */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: 'var(--admin-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.4rem'
                    }}>
                      {metric.label}
                    </p>
                    <p style={{
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      color: 'var(--admin-text-primary)',
                      margin: 0,
                      lineHeight: 1,
                      marginBottom: '0.4rem'
                    }}>
                      {metric.value}
                    </p>
                    <p style={{
                      fontSize: '0.65rem',
                      color: 'var(--admin-text-secondary)',
                      margin: 0
                    }}>
                      {metric.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity Log */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--admin-card-bg)',
                borderRadius: '0.75rem',
                border: '1px solid var(--admin-border)',
                boxShadow: 'var(--admin-shadow-medium)'
              }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--admin-text-primary)',
                  marginBottom: '1.5rem'
                }}>
                  Recent Activity
                </h2>

                <div style={{
                  maxHeight: '500px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {events.map((event) => (
                    <div
                      key={event.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: 'var(--admin-bg)',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--admin-border)',
                        transition: 'all 0.2s ease',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                        {/* Event Icon */}
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '0.5rem',
                          backgroundColor: `${getEventColor(event.risk)}20`,
                          border: `2px solid ${getEventColor(event.risk)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: getEventColor(event.risk),
                          flexShrink: 0
                        }}>
                          {getEventIcon(event.type)}
                        </div>

                        {/* Event Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontWeight: 600,
                            color: 'var(--admin-text-primary)',
                            margin: 0,
                            marginBottom: '0.25rem',
                            fontSize: '0.875rem'
                          }}>
                            {event.description}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--admin-text-secondary)',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                          }}>
                            <span>{event.user}</span>
                            <span>•</span>
                            <span>{event.timestamp}</span>
                            <span>•</span>
                            <span style={{ fontFamily: 'monospace' }}>{event.ipAddress}</span>
                          </p>
                        </div>
                      </div>

                      {/* Risk Badge */}
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: getEventColor(event.risk),
                        backgroundColor: `${getEventColor(event.risk)}20`,
                        borderRadius: '0.375rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em',
                        flexShrink: 0
                      }}>
                        {event.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Access Controls */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--admin-card-bg)',
                borderRadius: '0.75rem',
                border: '1px solid var(--admin-border)',
                boxShadow: 'var(--admin-shadow-medium)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--admin-text-primary)',
                    margin: 0
                  }}>
                    Access Controls
                  </h2>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'white',
                      backgroundColor: 'var(--admin-accent)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Manage Users
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--admin-text-secondary)',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em'
                        }}>
                          Username
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--admin-text-secondary)',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em'
                        }}>
                          Role
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--admin-text-secondary)',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em'
                        }}>
                          Last Login
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--admin-text-secondary)',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em'
                        }}>
                          Status
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: 'var(--admin-text-secondary)',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em'
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessControlUsers.map((user) => (
                        <tr
                          key={user.id}
                          style={{
                            borderBottom: '1px solid var(--admin-border)',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{
                            padding: '1rem 0.75rem',
                            color: 'var(--admin-text-primary)',
                            fontWeight: 500
                          }}>
                            {user.username}
                          </td>
                          <td style={{
                            padding: '1rem 0.75rem',
                            color: 'var(--admin-text-primary)'
                          }}>
                            {user.role}
                          </td>
                          <td style={{
                            padding: '1rem 0.75rem',
                            color: 'var(--admin-text-secondary)'
                          }}>
                            {user.lastLogin}
                          </td>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <span style={{
                              padding: '0.25rem 0.625rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: '0.375rem',
                              color: user.status === 'active' ? '#10B981' : user.status === 'inactive' ? '#6B7280' : '#EF4444',
                              backgroundColor: user.status === 'active' ? '#10B98120' : user.status === 'inactive' ? '#6B728020' : '#EF444420'
                            }}>
                              {user.status}
                            </span>
                          </td>
                          <td style={{
                            padding: '1rem 0.75rem',
                            textAlign: 'right'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  color: 'var(--admin-text-primary)',
                                  backgroundColor: 'var(--admin-bg)',
                                  border: '1px solid var(--admin-border)',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--admin-card-bg)'
                                  e.currentTarget.style.borderColor = 'var(--admin-accent)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--admin-bg)'
                                  e.currentTarget.style.borderColor = 'var(--admin-border)'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  color: '#EF4444',
                                  backgroundColor: '#EF444410',
                                  border: '1px solid #EF444440',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#EF444420'
                                  e.currentTarget.style.borderColor = '#EF4444'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#EF444410'
                                  e.currentTarget.style.borderColor = '#EF444440'
                                }}
                              >
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '2rem',
              paddingBottom: '1rem',
              borderTop: '1px solid var(--admin-border)',
              fontSize: '0.875rem',
              color: 'var(--admin-text-secondary)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--admin-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--admin-accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--admin-text-secondary)'}
              >
                <span>🌐</span>
                View Site
              </a>
              <span>TWR Admin</span>
            </div>
          </div>
        </div>

        {/* Security Audit Modal */}
        {showAuditModal && (() => {
          const auditData = typeof window !== 'undefined' ? sessionStorage.getItem('lastAuditReport') : null
          const auditReport = auditData ? JSON.parse(auditData) : null

          return (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
                overflow: 'auto'
              }}
              onClick={() => setShowAuditModal(false)}
            >
              <div
                style={{
                  backgroundColor: 'var(--admin-card-bg)',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  maxWidth: '800px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--admin-text-primary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🔍</span>
                  Security Audit Results
                </h3>

                {auditReport ? (
                  <>
                    {/* Summary */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '1rem',
                      marginBottom: '2rem'
                    }}>
                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--admin-bg)',
                        borderRadius: '0.5rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getScoreColor() }}>
                          {auditReport.overallScore}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                          Security Score
                        </div>
                      </div>
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#EF444410',
                        borderRadius: '0.5rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF4444' }}>
                          {auditReport.summary.critical + auditReport.summary.high}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                          Critical/High
                        </div>
                      </div>
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#10B98110',
                        borderRadius: '0.5rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>
                          {auditReport.checks.passed}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                          Checks Passed
                        </div>
                      </div>
                    </div>

                    {/* Findings */}
                    {auditReport.findings.length > 0 ? (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: 'var(--admin-text-primary)',
                          marginBottom: '1rem'
                        }}>
                          Security Findings ({auditReport.findings.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {auditReport.findings.map((finding: any) => (
                            <div
                              key={finding.id}
                              style={{
                                padding: '1rem',
                                backgroundColor: 'var(--admin-bg)',
                                borderRadius: '0.5rem',
                                borderLeft: `4px solid ${
                                  finding.severity === 'critical' ? '#EF4444' :
                                  finding.severity === 'high' ? '#F59E0B' :
                                  finding.severity === 'medium' ? '#3B82F6' : '#6B7280'
                                }`
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.5rem'
                              }}>
                                <h5 style={{
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  color: 'var(--admin-text-primary)',
                                  margin: 0
                                }}>
                                  {finding.title}
                                </h5>
                                <span style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  borderRadius: '0.25rem',
                                  color: finding.severity === 'critical' ? '#EF4444' :
                                         finding.severity === 'high' ? '#F59E0B' :
                                         finding.severity === 'medium' ? '#3B82F6' : '#6B7280',
                                  backgroundColor: finding.severity === 'critical' ? '#EF444420' :
                                                   finding.severity === 'high' ? '#F59E0B20' :
                                                   finding.severity === 'medium' ? '#3B82F620' : '#6B728020'
                                }}>
                                  {finding.severity}
                                </span>
                              </div>
                              <p style={{
                                fontSize: '0.8rem',
                                color: 'var(--admin-text-secondary)',
                                margin: '0 0 0.5rem 0'
                              }}>
                                {finding.description}
                              </p>
                              <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--admin-text-primary)',
                                margin: 0,
                                fontStyle: 'italic'
                              }}>
                                💡 {finding.recommendation}
                              </p>
                              {finding.affectedItems && finding.affectedItems.length > 0 && (
                                <div style={{
                                  marginTop: '0.5rem',
                                  padding: '0.5rem',
                                  backgroundColor: 'var(--admin-card-bg)',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.7rem',
                                  fontFamily: 'monospace',
                                  color: 'var(--admin-text-secondary)'
                                }}>
                                  Affected: {finding.affectedItems.slice(0, 3).join(', ')}
                                  {finding.affectedItems.length > 3 && ` (+${finding.affectedItems.length - 3} more)`}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        backgroundColor: '#10B98110',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                        <p style={{ color: '#10B981', fontWeight: 600, margin: 0 }}>
                          No security issues found!
                        </p>
                      </div>
                    )}

                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--admin-text-secondary)',
                      textAlign: 'center',
                      marginBottom: '1rem'
                    }}>
                      Audit completed at {new Date(auditReport.timestamp).toLocaleString()}
                    </div>
                  </>
                ) : (
                  <p style={{ color: 'var(--admin-text-secondary)', textAlign: 'center' }}>
                    No audit data available. Run an audit to see results.
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => setShowAuditModal(false)}
                    style={{
                      padding: '0.625rem 1.25rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'white',
                      backgroundColor: 'var(--admin-accent)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </AdminLayout>
    </>
  )
}
