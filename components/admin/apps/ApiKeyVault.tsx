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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">API Key Vault</h2>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Key
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            ⚠️ API keys are encrypted and cannot be retrieved after creation. Store them securely.
          </p>
        </div>

        <div className="space-y-3">
          {keys.map(key => (
            <div key={key.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{key.label}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-400">Scope: {key.scope}</span>
                  <span className="text-sm text-gray-400 font-mono">****{key.last4}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`w-12 h-6 rounded-full ${key.enabled ? 'bg-green-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    key.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Rotate</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Label</label>
                <input type="text" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Scope</label>
                <input type="text" placeholder="e.g., integration:service" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Secret Key</label>
                <input type="password" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}