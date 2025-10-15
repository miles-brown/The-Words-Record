/**
 * IntegrationManager Component
 * Manages external service integrations (Supabase, Gmail, Discord, OpenAI, Vercel, Cloudflare, etc.)
 */

import { useState, useEffect } from 'react'

interface Integration {
  id: string
  provider: string
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'error'
  logo: string
  lastPing?: number
  config?: any
  createdAt: string
  updatedAt: string
}

interface IntegrationConfig {
  [key: string]: {
    name: string
    fields: { name: string; label: string; type: string; required?: boolean; placeholder?: string }[]
  }
}

export default function IntegrationManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [configValues, setConfigValues] = useState<Record<string, string>>({})

  // Provider configurations
  const providers: IntegrationConfig = {
    supabase: {
      name: 'Supabase',
      fields: [
        { name: 'projectUrl', label: 'Project URL', type: 'url', required: true, placeholder: 'https://xxx.supabase.co' },
        { name: 'anonKey', label: 'Anon Key', type: 'password', required: true },
        { name: 'serviceKey', label: 'Service Role Key', type: 'password', required: false }
      ]
    },
    gmail: {
      name: 'Gmail',
      fields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'redirectUri', label: 'Redirect URI', type: 'url', required: true }
      ]
    },
    discord: {
      name: 'Discord',
      fields: [
        { name: 'botToken', label: 'Bot Token', type: 'password', required: true },
        { name: 'webhookUrl', label: 'Webhook URL', type: 'url', required: false },
        { name: 'guildId', label: 'Guild ID', type: 'text', required: false }
      ]
    },
    openai: {
      name: 'OpenAI',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'organizationId', label: 'Organization ID', type: 'text', required: false },
        { name: 'model', label: 'Default Model', type: 'text', placeholder: 'gpt-4' }
      ]
    },
    vercel: {
      name: 'Vercel',
      fields: [
        { name: 'token', label: 'Access Token', type: 'password', required: true },
        { name: 'teamId', label: 'Team ID', type: 'text', required: false },
        { name: 'projectId', label: 'Project ID', type: 'text', required: false }
      ]
    },
    cloudflare: {
      name: 'Cloudflare',
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
      const response = await fetch('/api/admin/apps/integrations')
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data)
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
    setShowConnectModal(true)
  }

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return

    try {
      const response = await fetch(`/api/admin/apps/integrations/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchIntegrations()
      }
    } catch (error) {
      console.error('Failed to disconnect integration:', error)
    }
  }

  const handlePing = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/apps/integrations/${id}/ping`, {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setIntegrations(integrations.map(i =>
          i.id === id ? { ...i, lastPing: data.latency, status: data.status } : i
        ))
      }
    } catch (error) {
      console.error('Ping failed:', error)
    }
  }

  const handleSaveConnection = async () => {
    if (!selectedProvider) return

    try {
      const response = await fetch('/api/admin/apps/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          name: providers[selectedProvider].name,
          config: configValues
        })
      })

      if (response.ok) {
        setShowConnectModal(false)
        fetchIntegrations()
      }
    } catch (error) {
      console.error('Failed to save integration:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-900/50 text-green-400 border-green-800'
      case 'error': return 'bg-red-900/50 text-red-400 border-red-800'
      default: return 'bg-gray-900/50 text-gray-400 border-gray-800'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Integration Manager</h2>
        <button
          type="button"
          onClick={() => setShowConnectModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Integration
        </button>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(providers).map(([key, provider]) => {
          const integration = integrations.find(i => i.provider === key)
          const isConnected = integration?.status === 'connected'

          return (
            <div key={key} className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getProviderLogo(key)}</div>
                  <div>
                    <h3 className="font-semibold text-white">{provider.name}</h3>
                    <p className="text-sm text-gray-400">
                      {integration ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                {integration && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                )}
              </div>

              {integration && (
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last ping:</span>
                    <span className="text-gray-300">
                      {integration.lastPing ? `${integration.lastPing}ms` : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Connected:</span>
                    <span className="text-gray-300">
                      {new Date(integration.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {integration ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePing(integration.id)}
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Ping
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConnect(key)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Configure
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisconnect(integration.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnect(key)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Connect {providers[selectedProvider].name}
            </h3>

            <div className="space-y-4">
              {providers[selectedProvider].fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={configValues[field.name] || ''}
                    onChange={(e) => setConfigValues({
                      ...configValues,
                      [field.name]: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConnection}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}