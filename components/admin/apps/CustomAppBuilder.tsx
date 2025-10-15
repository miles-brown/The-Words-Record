import { useState } from 'react'

export default function CustomAppBuilder() {
  const [customApps] = useState([
    { id: '1', name: 'Quick Report', description: 'Generate custom reports', inputs: 2, lastRun: '2024-01-15' },
    { id: '2', name: 'Bulk Importer', description: 'Import CSV data', inputs: 3, lastRun: '2024-01-14' },
    { id: '3', name: 'Data Validator', description: 'Validate data integrity', inputs: 1, lastRun: '2024-01-13' }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Custom App Builder</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Create App
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customApps.map(app => (
          <div key={app.id} className="bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-shadow">
            <h3 className="font-semibold text-white mb-2">{app.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{app.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Inputs:</span>
                <span className="text-gray-300">{app.inputs} fields</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last run:</span>
                <span className="text-gray-300">{app.lastRun}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Run</button>
              <button className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}