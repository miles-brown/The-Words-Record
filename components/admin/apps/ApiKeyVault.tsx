/**
 * ApiKeyVault Component
 * Secure API key management
 * Redesigned to match admin design system
 */

import { useState } from 'react'

interface ApiKey {
  id: string
  label: string
  scope: string
  last4: string
  createdAt: string
  updatedAt: string
  enabled: boolean
}

export default function ApiKeyVault() {
  const [keys] = useState<ApiKey[]>([
    { id: '1', label: 'Production API', scope: 'api:production', last4: '...a3f4', createdAt: '2024-01-01', updatedAt: '2024-01-01', enabled: true },
    { id: '2', label: 'OpenAI Key', scope: 'integration:openai', last4: '...b5c8', createdAt: '2024-01-02', updatedAt: '2024-01-02', enabled: true },
    { id: '3', label: 'Discord Webhook', scope: 'webhook:discord', last4: '...d7e2', createdAt: '2024-01-03', updatedAt: '2024-01-03', enabled: false }
  ])
  const [showCreateModal, setShowCreateModal] = useState(false)

  const stats = {
    total: keys.length,
    active: keys.filter(k => k.enabled).length,
    inactive: keys.filter(k => !k.enabled).length,
    scopes: new Set(keys.map(k => k.scope.split(':')[0])).size
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <h2 className="admin-section-header">Overview</h2>
        <div className="admin-grid admin-grid-cols-4">
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-indigo)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>🔑</div>
            <div className="admin-metric-value">{stats.total}</div>
            <div className="admin-metric-label">Total Keys</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-green)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>✅</div>
            <div className="admin-metric-value">{stats.active}</div>
            <div className="admin-metric-label">Active</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-grey)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>⏸️</div>
            <div className="admin-metric-value">{stats.inactive}</div>
            <div className="admin-metric-label">Inactive</div>
          </div>
          <div className="admin-metric-card" style={{ backgroundColor: 'var(--metric-purple)' }}>
            <div className="admin-metric-icon" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>🏷️</div>
            <div className="admin-metric-value">{stats.scopes}</div>
            <div className="admin-metric-label">Scopes</div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="admin-section">
        <div className="admin-flex-between admin-mb-4">
          <h2 className="admin-section-header" style={{ margin: 0 }}>API Keys</h2>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="admin-btn admin-btn-primary"
          >
            + Add Key
          </button>
        </div>

        {/* Security Warning */}
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <p className="admin-text-sm" style={{ color: '#92400E', margin: 0 }}>
            ⚠️ API keys are encrypted and cannot be retrieved after creation. Store them securely.
          </p>
        </div>

        {/* Keys List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {keys.map(key => (
            <div key={key.id} className="admin-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 className="admin-font-semibold" style={{ fontSize: '1rem', color: 'var(--admin-text-primary)', marginBottom: '0.25rem' }}>
                  {key.label}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                  <span className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                    Scope: {key.scope}
                  </span>
                  <code className="admin-text-sm" style={{
                    fontFamily: 'Monaco, monospace',
                    backgroundColor: 'var(--admin-bg)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    ****{key.last4}
                  </code>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  style={{
                    width: '3rem',
                    height: '1.5rem',
                    borderRadius: '9999px',
                    backgroundColor: key.enabled ? '#10B981' : 'var(--admin-border)',
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
                    left: key.enabled ? '1.625rem' : '0.125rem',
                    transition: 'left 0.2s'
                  }} />
                </button>
                <button className="admin-btn admin-btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                  Rotate
                </button>
                <button
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
            </div>
          ))}
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
              Add API Key
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-text-sm admin-font-semibold" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Label
                </label>
                <input
                  type="text"
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
                  Scope
                </label>
                <input
                  type="text"
                  placeholder="e.g., integration:service"
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
                  Secret Key
                </label>
                <input
                  type="password"
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
                onClick={() => setShowCreateModal(false)}
                className="admin-btn admin-btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" style={{ flex: 1 }}>
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
