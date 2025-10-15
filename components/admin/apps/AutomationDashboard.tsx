import { useState } from 'react'

interface Automation {
  id: string
  name: string
  trigger: string
  enabled: boolean
  lastRun?: string
  lastStatus?: 'ok' | 'error' | 'skipped'
}

export default function AutomationDashboard() {
  const [automations] = useState<Automation[]>([
    {
      id: '1',
      name: 'New User Welcome',
      trigger: 'event:user.created',
      enabled: true,
      lastRun: '2024-01-15T10:00:00Z',
      lastStatus: 'ok'
    },
    {
      id: '2',
      name: 'Daily Report',
      trigger: 'cron:0 9 * * *',
      enabled: true,
      lastRun: '2024-01-15T09:00:00Z',
      lastStatus: 'ok'
    }
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Automation Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations.map(auto => (
          <div key={auto.id} className="bg-gray-800 rounded-2xl p-6">
            <h3 className="font-semibold text-white">{auto.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{auto.trigger}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs ${
                auto.enabled ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {auto.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
                Run Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}