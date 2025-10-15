import { useState } from 'react'

export default function TaskManager() {
  const [tasks] = useState([
    { id: '1', name: 'Database Backup', type: 'scheduled', status: 'idle', lastRun: '2024-01-15T00:00:00Z', nextRun: '2024-01-16T00:00:00Z' },
    { id: '2', name: 'Cache Clear', type: 'manual', status: 'running', lastRun: '2024-01-15T10:00:00Z' },
    { id: '3', name: 'Report Generation', type: 'scheduled', status: 'paused', lastRun: '2024-01-14T09:00:00Z' }
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Task Manager</h2>
      <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Type</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Last Run</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Next Run</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="py-3 px-6 text-white">{task.name}</td>
                <td className="py-3 px-6 text-gray-300">{task.type}</td>
                <td className="py-3 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'running' ? 'bg-yellow-900/50 text-yellow-400' :
                    task.status === 'paused' ? 'bg-gray-700 text-gray-400' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-gray-400 text-sm">
                  {task.lastRun ? new Date(task.lastRun).toLocaleString() : '-'}
                </td>
                <td className="py-3 px-6 text-gray-400 text-sm">
                  {task.nextRun ? new Date(task.nextRun).toLocaleString() : '-'}
                </td>
                <td className="py-3 px-6">
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
                      {task.status === 'paused' ? 'Resume' : task.status === 'running' ? 'Pause' : 'Run'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}