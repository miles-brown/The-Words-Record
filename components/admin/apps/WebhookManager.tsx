/**
 * WebhookManager Component
 * Manages incoming and outgoing webhooks
 * Redesigned to match admin design system
 */

import { useState, useEffect } from 'react'

interface Webhook {
  id: string
  direction: 'incoming' | 'outgoing'
  name: string
  url: string
  secretLast4?: string
  enabled: boolean
  lastStatus?: string
  lastFired?: string
  createdAt: string
  updatedAt: string
}

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)
  const [testPayload, setTestPayload] = useState<string>('{\n  "event": "test",\n  "data": {\n    "message": "Hello from TWR"\n  }\n}')
  const [testResult, setTestResult] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    direction: 'outgoing' as 'incoming' | 'outgoing'
  })

  useEffect(() => {
    fetchWebhooks()

    // Listen for refresh events
    const handleRefresh = () => fetchWebhooks()
    window.addEventListener('refresh-all', handleRefresh)
    return () => window.removeEventListener('refresh-all', handleRefresh)
  }, [])

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/apps/webhooks', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data)
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
      // Mock data for development
      setWebhooks([
        {
          id: '1',
          direction: 'incoming',
          name: 'GitHub Events',
          url: 'https://api.who-said-what.com/webhooks/github',
          secretLast4: '...a3f4',
          enabled: true,
          lastStatus: '200',
          lastFired: '2 minutes ago',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '2',
          direction: 'outgoing',
          name: 'Slack Notifications',
          url: 'https://hooks.slack.com/services/xxx',
          secretLast4: '...b5c8',
          enabled: true,
          lastStatus: '200',
          lastFired: '1 hour ago',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '3',
          direction: 'outgoing',
          name: 'Discord Updates',
          url: 'https://discord.com/api/webhooks/xxx',
          secretLast4: '...d7e2',
          enabled: false,
          lastStatus: 'timeout',
          lastFired: '3 days ago',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      url: '',
      secret: '',
      direction: activeTab
    })
    setShowCreateModal(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/apps/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchWebhooks()
      }
    } catch (error) {
      console.error('Failed to create webhook:', error)
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/apps/webhooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        setWebhooks(webhooks.map(w =>
          w.id === id ? { ...w, enabled } : w
        ))
      }
    } catch (error) {
      console.error('Failed to toggle webhook:', error)
    }
  }

  const handleTest = (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setTestResult(null)
    setShowTestModal(true)
  }

  const handleSendTest = async () => {
    if (!selectedWebhook) return

    try {
      const response = await fetch('/api/admin/apps/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookId: selectedWebhook.id,
          payload: JSON.parse(testPayload)
        })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: 'Failed to send test: ' + error })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      const response = await fetch(`/api/admin/apps/webhooks/${id}`, {
        credentials: 'include',
        method: 'DELETE'
      })

      if (response.ok) {
        fetchWebhooks()
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const filteredWebhooks = webhooks.filter(w => w.direction === activeTab)

  const stats = {
    total: webhooks.length,
    incoming: webhooks.filter(w => w.direction === 'incoming').length,
    outgoing: webhooks.filter(w => w.direction === 'outgoing').length,
    active: webhooks.filter(w => w.enabled).length
  }

  if (loading) {
    return (
      <div className="admin-flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: '3rem', height: '3rem', border: '4px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <h2 className="admin-section-header">Overview</h2>
        <div className="admin-grid admin-grid-cols-4">
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-blue)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>🔔</div>
            <div className="admin-metric-value">{stats.total}</div>
            <div className="admin-metric-label">Total Webhooks</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>📥</div>
            <div className="admin-metric-value">{stats.incoming}</div>
            <div className="admin-metric-label">Incoming</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-purple)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>📤</div>
            <div className="admin-metric-value">{stats.outgoing}</div>
            <div className="admin-metric-label">Outgoing</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-amber)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>✅</div>
            <div className="admin-metric-value">{stats.active}</div>
            <div className="admin-metric-label">Active</div>
          </div>
        </div>
      </div>

      {/* Direction Tabs & Table */}
      <div className="admin-section">
        <div className="admin-flex-between admin-mb-4">
          <h2 className="admin-section-header" style={{ margin: 0 }}>Webhooks</h2>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Direction Toggle */}
            <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', backgroundColor: 'var(--admin-bg)', borderRadius: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveTab('incoming')}
                className="admin-btn"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: activeTab === 'incoming' ? 'var(--admin-accent)' : 'transparent',
                  color: activeTab === 'incoming' ? 'white' : 'var(--admin-text-secondary)'
                }}
              >
                Incoming
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('outgoing')}
                className="admin-btn"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: activeTab === 'outgoing' ? 'var(--admin-accent)' : 'transparent',
                  color: activeTab === 'outgoing' ? 'white' : 'var(--admin-text-secondary)'
                }}
              >
                Outgoing
              </button>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="admin-btn admin-btn-primary"
            >
              + Create Webhook
            </button>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th>Secret</th>
                <th style={{ textAlign: 'center' }}>Enabled</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th>Last Fired</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWebhooks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '2rem' }}>
                    No {activeTab} webhooks configured
                  </td>
                </tr>
              ) : (
                filteredWebhooks.map((webhook) => (
                  <tr key={webhook.id}>
                    <td className="admin-font-semibold">{webhook.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code className="admin-text-sm" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {webhook.url}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyUrl(webhook.url)}
                          className="admin-text-sm"
                          style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                          title="Copy URL"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="admin-text-sm"><code>{webhook.secretLast4 || 'None'}</code></td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggle(webhook.id, !webhook.enabled)}
                        style={{
                          width: '3rem',
                          height: '1.5rem',
                          borderRadius: '9999px',
                          backgroundColor: webhook.enabled ? '#10B981' : 'var(--admin-border)',
                          position: 'relative',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '0.125rem',
                          left: webhook.enabled ? '1.625rem' : '0.125rem',
                          transition: 'left 0.2s'
                        }} />
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {webhook.lastStatus && (
                        <span className={`admin-badge ${
                          webhook.lastStatus === '200' ? 'admin-badge-success' :
                          webhook.lastStatus === 'timeout' ? 'admin-badge-warning' :
                          'admin-badge-error'
                        }`}>
                          {webhook.lastStatus}
                        </span>
                      )}
                    </td>
                    <td className="admin-text-sm">{webhook.lastFired || 'Never'}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleTest(webhook)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                        >
                          Test
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(webhook.id)}
                          className="admin-btn"
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.8125rem',
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            border: '1px solid #FECACA'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div className="admin-card" style={{ maxWidth: '28rem', width: '100%', margin: '1rem' }}>
            <h3 className="admin-section-header" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
              Create {activeTab} Webhook
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-text-sm admin-font-semibold" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--admin-border)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--admin-card-bg)',
                    color: 'var(--admin-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="admin-text-sm admin-font-semibold" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  URL <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--admin-border)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--admin-card-bg)',
                    color: 'var(--admin-text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="admin-text-sm admin-font-semibold" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Secret (optional)
                </label>
                <input
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--admin-border)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--admin-card-bg)',
                    color: 'var(--admin-text-primary)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="admin-btn admin-btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="admin-btn admin-btn-primary"
                style={{ flex: 1 }}
              >
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal - Similar pattern as Create Modal */}
      {showTestModal && selectedWebhook && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div className="admin-card" style={{ maxWidth: '42rem', width: '100%', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="admin-section-header" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
              Test Webhook: {selectedWebhook.name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-text-sm admin-font-semibold" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Test Payload (JSON)
                </label>
                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--admin-border)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--admin-card-bg)',
                    color: 'var(--admin-text-primary)',
                    fontFamily: 'Monaco, monospace',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {testResult && (
                <div style={{ backgroundColor: 'var(--admin-bg)', borderRadius: '0.5rem', padding: '1rem' }}>
                  <h4 className="admin-text-sm admin-font-semibold" style={{ marginBottom: '0.5rem' }}>Response:</h4>
                  <pre className="admin-text-sm" style={{ overflow: 'auto' }}>
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="admin-btn admin-btn-secondary"
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                className="admin-btn admin-btn-primary"
                style={{ flex: 1 }}
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
