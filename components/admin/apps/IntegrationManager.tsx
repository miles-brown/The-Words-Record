/**
 * IntegrationManager Component
 * Manages external service integrations with full CRUD operations
 * Redesigned to match admin design system
 */

import { useState, useEffect } from 'react'
import LoadingSpinner from './components/common/LoadingSpinner'
import Modal from './components/common/Modal'
import StatusBadge from './components/common/StatusBadge'
import ConfirmDialog from './components/common/ConfirmDialog'

interface Integration {
  id: string
  provider: string
  name: string
  description?: string | null
  status: string
  logo?: string | null
  lastPing?: number | null
  lastPingAt?: string | Date | null
  config?: any
  createdAt: string | Date
  updatedAt: string | Date
}

interface IntegrationConfig {
  [key: string]: {
    name: string
    description: string
    fields: { name: string; label: string; type: string; required?: boolean; placeholder?: string }[]
  }
}

export default function IntegrationManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [configValues, setConfigValues] = useState<Record<string, string>>({})
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Integration | null>(null)
  const [pinging, setPinging] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Provider configurations
  const providers: IntegrationConfig = {
    supabase: {
      name: 'Supabase',
      description: 'Database and backend services',
      fields: [
        { name: 'projectUrl', label: 'Project URL', type: 'url', required: true, placeholder: 'https://xxx.supabase.co' },
        { name: 'anonKey', label: 'Anon Key', type: 'password', required: true },
        { name: 'serviceKey', label: 'Service Role Key', type: 'password', required: false }
      ]
    },
    gmail: {
      name: 'Gmail',
      description: 'Email sending and notifications',
      fields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'redirectUri', label: 'Redirect URI', type: 'url', required: true }
      ]
    },
    discord: {
      name: 'Discord',
      description: 'Notifications and community',
      fields: [
        { name: 'botToken', label: 'Bot Token', type: 'password', required: true },
        { name: 'webhookUrl', label: 'Webhook URL', type: 'url', required: false },
        { name: 'guildId', label: 'Guild ID', type: 'text', required: false }
      ]
    },
    openai: {
      name: 'OpenAI',
      description: 'AI-powered features',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'organizationId', label: 'Organization ID', type: 'text', required: false },
        { name: 'model', label: 'Default Model', type: 'text', placeholder: 'gpt-4' }
      ]
    },
    vercel: {
      name: 'Vercel',
      description: 'Deployment and hosting',
      fields: [
        { name: 'token', label: 'Access Token', type: 'password', required: true },
        { name: 'teamId', label: 'Team ID', type: 'text', required: false },
        { name: 'projectId', label: 'Project ID', type: 'text', required: false }
      ]
    },
    cloudflare: {
      name: 'Cloudflare',
      description: 'CDN and security',
      fields: [
        { name: 'apiToken', label: 'API Token', type: 'password', required: true },
        { name: 'zoneId', label: 'Zone ID', type: 'text', required: false },
        { name: 'accountId', label: 'Account ID', type: 'text', required: false }
      ]
    }
  }

  useEffect(() => {
    fetchIntegrations()

    // Listen for refresh events
    const handleRefresh = () => fetchIntegrations()
    window.addEventListener('refresh-all', handleRefresh)
    return () => window.removeEventListener('refresh-all', handleRefresh)
  }, [])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/apps/integrations')
      if (response.ok) {
        const result = await response.json()
        setIntegrations(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (provider: string) => {
    setSelectedProvider(provider)
    setConfigValues({})
    setEditingIntegration(null)
    setShowConnectModal(true)
  }

  const handleEdit = (integration: Integration) => {
    setSelectedProvider(integration.provider)
    setConfigValues(integration.config || {})
    setEditingIntegration(integration)
    setShowConnectModal(true)
  }

  const handleDisconnect = async (integration: Integration) => {
    setDeleteConfirm(integration)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const response = await fetch(`/api/apps/integrations/${deleteConfirm.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchIntegrations()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to disconnect integration:', error)
    }
  }

  const handlePing = async (id: string) => {
    try {
      setPinging(id)
      const response = await fetch(`/api/apps/integrations/${id}/ping`, {
        method: 'POST'
      })
      if (response.ok) {
        await fetchIntegrations()
      }
    } catch (error) {
      console.error('Ping failed:', error)
    } finally {
      setPinging(null)
    }
  }

  const handleSaveConnection = async () => {
    if (!selectedProvider) return

    try {
      setSaving(true)

      if (editingIntegration) {
        // Update existing
        const response = await fetch(`/api/apps/integrations/${editingIntegration.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: configValues
          })
        })

        if (response.ok) {
          setShowConnectModal(false)
          await fetchIntegrations()
        }
      } else {
        // Create new
        const response = await fetch('/api/apps/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: selectedProvider,
            name: providers[selectedProvider].name,
            description: providers[selectedProvider].description,
            config: configValues,
            logo: getProviderLogo(selectedProvider)
          })
        })

        if (response.ok) {
          setShowConnectModal(false)
          await fetchIntegrations()
        } else {
          const error = await response.json()
          alert(error.message || 'Failed to save integration')
        }
      }
    } catch (error) {
      console.error('Failed to save integration:', error)
      alert('Failed to save integration')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success'
      case 'degraded': return 'warning'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  const getProviderLogo = (provider: string) => {
    const logos: Record<string, string> = {
      supabase: '🗄️',
      gmail: '📧',
      discord: '💬',
      openai: '🤖',
      vercel: '▲',
      cloudflare: '☁️'
    }
    return logos[provider] || '🔌'
  }

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (date: string | Date | null | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="admin-flex-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    )
  }

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    degraded: integrations.filter(i => i.status === 'degraded').length,
    errors: integrations.filter(i => i.status === 'error').length
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <h2 className="admin-section-header">Overview</h2>
        <div className="admin-grid admin-grid-cols-4">
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-blue)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
              🔌
            </div>
            <div className="admin-metric-value">{stats.total}</div>
            <div className="admin-metric-label">Total Integrations</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
              ✅
            </div>
            <div className="admin-metric-value">{stats.connected}</div>
            <div className="admin-metric-label">Connected</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-amber)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
              ⚠️
            </div>
            <div className="admin-metric-value">{stats.degraded}</div>
            <div className="admin-metric-label">Degraded</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-pink)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
              ❌
            </div>
            <div className="admin-metric-value">{stats.errors}</div>
            <div className="admin-metric-label">Errors</div>
          </div>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="admin-section">
        <h2 className="admin-section-header">Available Integrations</h2>
        <div className="admin-grid admin-grid-auto">
          {Object.entries(providers).map(([key, provider]) => {
            const integration = integrations.find(i => i.provider === key)
            const isPinging = pinging === integration?.id

            return (
              <div key={key} className="admin-card">
                {/* Header with logo and name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '2rem', lineHeight: 1 }}>{getProviderLogo(key)}</div>
                    <div>
                      <h3 className="admin-font-semibold" style={{ fontSize: '1.125rem', color: 'var(--admin-text-primary)', marginBottom: '0.25rem', lineHeight: 1.2 }}>
                        {provider.name}
                      </h3>
                      <p className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  {integration && (
                    <StatusBadge status={getStatusColor(integration.status)} text={integration.status} />
                  )}
                </div>

                {/* Integration details if connected */}
                {integration && (
                  <div className="admin-mb-4" style={{ padding: '0.75rem', backgroundColor: 'var(--admin-bg)', borderRadius: '0.5rem', borderTop: '1px solid var(--admin-border)', paddingTop: '0.75rem' }}>
                    <div className="admin-flex-between admin-mb-2">
                      <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Last ping</span>
                      <span className="admin-text-sm admin-font-semibold">
                        {integration.lastPing ? (
                          <span style={{
                            color: integration.lastPing < 100 ? '#10B981' :
                                   integration.lastPing < 200 ? '#F59E0B' : '#EF4444'
                          }}>
                            {integration.lastPing}ms
                          </span>
                        ) : (
                          'Never'
                        )}
                      </span>
                    </div>
                    <div className="admin-flex-between admin-mb-2">
                      <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Last checked</span>
                      <span className="admin-text-sm" style={{ color: 'var(--admin-text-primary)' }}>
                        {formatDateTime(integration.lastPingAt)}
                      </span>
                    </div>
                    <div className="admin-flex-between">
                      <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Connected</span>
                      <span className="admin-text-sm" style={{ color: 'var(--admin-text-primary)' }}>
                        {formatDate(integration.createdAt)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {integration ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePing(integration.id)}
                        disabled={isPinging}
                        className="admin-btn admin-btn-secondary"
                        style={{ flex: '1 1 auto', minWidth: 'fit-content' }}
                      >
                        {isPinging ? 'Pinging...' : 'Ping'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(integration)}
                        className="admin-btn admin-btn-primary"
                        style={{ flex: '1 1 auto', minWidth: 'fit-content' }}
                      >
                        Configure
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisconnect(integration)}
                        className="admin-btn"
                        style={{
                          flex: '1 1 auto',
                          minWidth: 'fit-content',
                          backgroundColor: '#FEE2E2',
                          color: '#991B1B',
                          border: '1px solid #FECACA'
                        }}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(key)}
                      className="admin-btn"
                      style={{
                        width: '100%',
                        backgroundColor: '#111827',
                        color: 'white'
                      }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Connect/Edit Modal */}
      {showConnectModal && (
        <Modal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          title={editingIntegration ? `Configure ${editingIntegration.name}` : selectedProvider ? `Connect ${providers[selectedProvider]?.name}` : 'Select Provider'}
        >
          {!selectedProvider ? (
            <div className="admin-grid admin-grid-cols-2" style={{ gap: '1rem' }}>
              {Object.entries(providers).map(([key, provider]) => (
                <button
                  key={key}
                  onClick={() => setSelectedProvider(key)}
                  className="admin-card"
                  style={{
                    cursor: 'pointer',
                    textAlign: 'left',
                    border: '2px solid var(--admin-border)',
                    padding: '1rem'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{getProviderLogo(key)}</div>
                  <div className="admin-font-semibold" style={{ color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                    {provider.name}
                  </div>
                  <div className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                    {provider.description}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {providers[selectedProvider].fields.map((field) => (
                <div key={field.name}>
                  <label
                    className="admin-text-sm admin-font-semibold"
                    style={{
                      display: 'block',
                      color: 'var(--admin-text-primary)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {field.label}
                    {field.required && <span style={{ color: '#EF4444', marginLeft: '0.25rem' }}>*</span>}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={configValues[field.name] || ''}
                    onChange={(e) => setConfigValues({
                      ...configValues,
                      [field.name]: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      transition: 'border-color 0.2s',
                      backgroundColor: 'var(--admin-card-bg)',
                      color: 'var(--admin-text-primary)'
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="admin-btn admin-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConnection}
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                  style={{ flex: 1, opacity: saving ? 0.5 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Saving...' : editingIntegration ? 'Update Connection' : 'Save Connection'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="Disconnect Integration"
          message={`Are you sure you want to disconnect ${deleteConfirm.name}? This action cannot be undone.`}
          confirmText="Disconnect"
          confirmStyle="danger"
        />
      )}
    </>
  )
}
