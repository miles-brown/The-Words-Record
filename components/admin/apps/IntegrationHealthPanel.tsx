import { useState, useEffect } from 'react'

interface HealthCheck {
  provider: string
  status: 'ok' | 'error' | 'timeout'
  latencyMs: number
  checkedAt: string
  message?: string
}

export default function IntegrationHealthPanel() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { provider: 'Supabase', status: 'ok', latencyMs: 12, checkedAt: new Date().toISOString() },
    { provider: 'Vercel', status: 'ok', latencyMs: 8, checkedAt: new Date().toISOString() },
    { provider: 'Cloudflare', status: 'ok', latencyMs: 3, checkedAt: new Date().toISOString() },
    { provider: 'OpenAI', status: 'ok', latencyMs: 125, checkedAt: new Date().toISOString() },
    { provider: 'Discord', status: 'error', latencyMs: 0, checkedAt: new Date().toISOString(), message: 'Invalid token' },
    { provider: 'Gmail', status: 'timeout', latencyMs: 5000, checkedAt: new Date().toISOString(), message: 'Request timeout' }
  ])

  useEffect(() => {
    const handleRefresh = async () => {
      // Fetch health status
      try {
        const response = await fetch('/api/admin/apps/health')
        if (response.ok) {
          const data = await response.json()
          setHealthChecks(data)
        }
      } catch (error) {
        console.error('Health check failed:', error)
      }
    }

    window.addEventListener('refresh-health', handleRefresh)
    return () => window.removeEventListener('refresh-health', handleRefresh)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'timeout': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getLatencyColor = (ms: number) => {
    if (ms < 50) return 'text-green-400'
    if (ms < 200) return 'text-yellow-400'
    return 'text-red-400'
  }

  const overallHealth = healthChecks.filter(h => h.status === 'ok').length / healthChecks.length * 100

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Integration Health</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Overall Health: <span className={`font-bold ${overallHealth >= 80 ? 'text-green-400' : overallHealth >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {overallHealth.toFixed(0)}%
            </span>
          </span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Ping All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthChecks.map(check => (
          <div key={check.provider} className="bg-gray-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-white">{check.provider}</h3>
              <span className={`text-2xl ${getStatusColor(check.status)}`}>
                {check.status === 'ok' ? '✓' : check.status === 'error' ? '✗' : '⚠'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`font-medium ${getStatusColor(check.status)}`}>{check.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Latency:</span>
                <span className={`font-medium ${getLatencyColor(check.latencyMs)}`}>
                  {check.latencyMs}ms
                </span>
              </div>
              {check.message && (
                <div className="mt-3 p-2 bg-gray-900 rounded">
                  <p className="text-xs text-gray-400">{check.message}</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <button className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                Test Connection
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dependency Map (simplified) */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Dependency Map</h3>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-sm text-gray-400">
            <div className="mb-2">• Authentication → Supabase</div>
            <div className="mb-2">• Hosting → Vercel</div>
            <div className="mb-2">• CDN → Cloudflare</div>
            <div className="mb-2">• AI Features → OpenAI</div>
            <div className="mb-2">• Notifications → Discord, Gmail</div>
          </div>
        </div>
      </div>
    </div>
  )
}