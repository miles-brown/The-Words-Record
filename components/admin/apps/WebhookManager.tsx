/**
 * WebhookManager Component
 * Manages incoming and outgoing webhooks
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

interface TestPayload {
  event: string
  data: any
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
      const response = await fetch('/api/admin/apps/webhooks')
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

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const colors = {
      '200': 'bg-green-900/50 text-green-400 border-green-800',
      'timeout': 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
      'error': 'bg-red-900/50 text-red-400 border-red-800'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || colors.error}`}>
        {status}
      </span>
    )
  }

  const filteredWebhooks = webhooks.filter(w => w.direction === activeTab)

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
        <h2 className="text-xl font-semibold text-white">Webhook Manager</h2>
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Webhook
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('incoming')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'incoming'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Incoming
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('outgoing')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'outgoing'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Outgoing
        </button>
      </div>

      {/* Webhook Table */}
      <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">URL</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Secret</th>
              <th className="text-center py-3 px-6 text-sm font-medium text-gray-400">Enabled</th>
              <th className="text-center py-3 px-6 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Last Fired</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWebhooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No {activeTab} webhooks configured
                </td>
              </tr>
            ) : (
              filteredWebhooks.map((webhook) => (
                <tr key={webhook.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-6">
                    <div className="font-medium text-white">{webhook.name}</div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-sm font-mono truncate max-w-xs">
                        {webhook.url}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyUrl(webhook.url)}
                        className="text-gray-400 hover:text-white"
                        title="Copy URL"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-gray-400 font-mono text-sm">
                      {webhook.secretLast4 || 'None'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(webhook.id, !webhook.enabled)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        webhook.enabled ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        webhook.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {getStatusBadge(webhook.lastStatus)}
                  </td>
                  <td className="py-3 px-6 text-gray-400 text-sm">
                    {webhook.lastFired || 'Never'}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleTest(webhook)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Test
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(webhook.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Create {activeTab} Webhook</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Secret (optional)
                </label>
                <input
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && selectedWebhook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Test Webhook: {selectedWebhook.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Test Payload (JSON)
                </label>
                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {testResult && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Response:</h4>
                  <pre className="text-sm text-gray-400 overflow-x-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}