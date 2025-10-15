/**
 * ScriptManager Component
 * Manages scheduled scripts and code execution
 */

import { useState, useEffect } from 'react'

interface Script {
  id: string
  name: string
  description?: string
  schedule?: string
  codeRef: string
  enabled: boolean
  lastRunAt?: string
  lastRunStatus?: 'ok' | 'error'
  nextRunAt?: string
  createdAt: string
  updatedAt: string
}

export default function ScriptManager() {
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: '1',
      name: 'Daily Backup',
      description: 'Backup database to S3',
      schedule: '0 0 * * *',
      codeRef: 'scripts/backup.js',
      enabled: true,
      lastRunAt: '2024-01-15T00:00:00Z',
      lastRunStatus: 'ok',
      nextRunAt: '2024-01-16T00:00:00Z',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Cache Cleaner',
      description: 'Clear expired cache entries',
      schedule: '0 */6 * * *',
      codeRef: 'scripts/cache-clean.js',
      enabled: true,
      lastRunAt: '2024-01-15T06:00:00Z',
      lastRunStatus: 'ok',
      nextRunAt: '2024-01-15T12:00:00Z',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Report Generator',
      description: 'Generate weekly reports',
      schedule: '0 9 * * MON',
      codeRef: 'scripts/reports.js',
      enabled: false,
      lastRunAt: '2024-01-08T09:00:00Z',
      lastRunStatus: 'error',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const handleRunNow = async (id: string) => {
    try {
      const response = await fetch('/api/admin/apps/scripts/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: id })
      })

      if (response.ok) {
        // Update script status
        setScripts(scripts.map(s =>
          s.id === id ? { ...s, lastRunAt: new Date().toISOString(), lastRunStatus: 'ok' } : s
        ))
      }
    } catch (error) {
      console.error('Failed to run script:', error)
    }
  }

  const handleViewLogs = async (script: Script) => {
    setSelectedScript(script)
    setLogs([
      '[2024-01-15 00:00:00] Starting script execution...',
      '[2024-01-15 00:00:01] Connecting to database...',
      '[2024-01-15 00:00:02] Processing 1000 records...',
      '[2024-01-15 00:00:05] Backup completed successfully',
      '[2024-01-15 00:00:05] Script execution completed'
    ])
    setShowLogsModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Script Manager</h2>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Script
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Schedule</th>
              <th className="text-center py-3 px-6 text-sm font-medium text-gray-400">Enabled</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Last Run</th>
              <th className="text-center py-3 px-6 text-sm font-medium text-gray-400">Status</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scripts.map((script) => (
              <tr key={script.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-3 px-6">
                  <div>
                    <div className="font-medium text-white">{script.name}</div>
                    <div className="text-sm text-gray-400">{script.description}</div>
                  </div>
                </td>
                <td className="py-3 px-6">
                  <code className="text-sm text-gray-300 bg-gray-900 px-2 py-1 rounded">
                    {script.schedule || 'Manual'}
                  </code>
                </td>
                <td className="py-3 px-6 text-center">
                  <button
                    type="button"
                    className={`w-12 h-6 rounded-full ${script.enabled ? 'bg-green-600' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      script.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </td>
                <td className="py-3 px-6 text-sm text-gray-400">
                  {script.lastRunAt ? new Date(script.lastRunAt).toLocaleString() : 'Never'}
                </td>
                <td className="py-3 px-6 text-center">
                  {script.lastRunStatus && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      script.lastRunStatus === 'ok'
                        ? 'bg-green-900/50 text-green-400 border border-green-800'
                        : 'bg-red-900/50 text-red-400 border border-red-800'
                    }`}>
                      {script.lastRunStatus}
                    </span>
                  )}
                </td>
                <td className="py-3 px-6">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleRunNow(script.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Run Now
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewLogs(script)}
                      className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm"
                    >
                      View Logs
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logs Modal */}
      {showLogsModal && selectedScript && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Logs: {selectedScript.name}
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 font-mono">
                {logs.join('\n')}
              </pre>
            </div>
            <button
              type="button"
              onClick={() => setShowLogsModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}