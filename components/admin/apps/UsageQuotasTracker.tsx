import { useState } from 'react'

interface Quota {
  provider: string
  unit: string
  used: number
  limit: number
  period: string
  resetAt: string
}

export default function UsageQuotasTracker() {
  const [quotas] = useState<Quota[]>([
    { provider: 'OpenAI', unit: 'tokens', used: 450000, limit: 1000000, period: 'monthly', resetAt: '2024-02-01' },
    { provider: 'Gmail', unit: 'emails', used: 234, limit: 500, period: 'daily', resetAt: '2024-01-16' },
    { provider: 'Supabase', unit: 'GB bandwidth', used: 12.5, limit: 50, period: 'monthly', resetAt: '2024-02-01' },
    { provider: 'Cloudflare', unit: 'requests', used: 890000, limit: 1000000, period: 'monthly', resetAt: '2024-02-01' },
    { provider: 'Vercel', unit: 'function calls', used: 45000, limit: 100000, period: 'monthly', resetAt: '2024-02-01' },
    { provider: 'Discord', unit: 'messages', used: 4500, limit: 5000, period: 'daily', resetAt: '2024-01-16' }
  ])

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    if (percentage < 95) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getBadgeColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-900/50 text-green-400 border-green-800'
    if (percentage < 80) return 'bg-yellow-900/50 text-yellow-400 border-yellow-800'
    if (percentage < 95) return 'bg-orange-900/50 text-orange-400 border-orange-800'
    return 'bg-red-900/50 text-red-400 border-red-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Usage & Quotas</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotas.map(quota => {
          const percentage = (quota.used / quota.limit) * 100

          return (
            <div key={`${quota.provider}-${quota.unit}`} className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">{quota.provider}</h3>
                  <p className="text-sm text-gray-400">{quota.unit}</p>
                </div>
                {percentage >= 80 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(percentage)}`}>
                    {percentage >= 95 ? 'Critical' : 'Warning'}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Usage:</span>
                  <span className="text-white">
                    {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} {quota.unit}
                  </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getUsageColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{percentage.toFixed(1)}% used</span>
                  <span className="text-gray-500">Resets {quota.period}</span>
                </div>

                {quota.resetAt && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Next reset: {new Date(quota.resetAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-400">Services at Risk</p>
            <p className="text-2xl font-bold text-yellow-400">
              {quotas.filter(q => (q.used / q.limit) * 100 >= 80).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Average Usage</p>
            <p className="text-2xl font-bold text-white">
              {(quotas.reduce((acc, q) => acc + (q.used / q.limit) * 100, 0) / quotas.length).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Services</p>
            <p className="text-2xl font-bold text-white">{quotas.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}