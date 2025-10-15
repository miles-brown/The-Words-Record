/**
 * Admin Apps Page - Comprehensive integration and automation management
 * Manages external integrations, webhooks, scripts, automations, jobs, tasks, API keys, and custom apps
 */

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import IntegrationManager from '@/components/admin/apps/IntegrationManager'
import WebhookManager from '@/components/admin/apps/WebhookManager'
import ScriptManager from '@/components/admin/apps/ScriptManager'
import AutomationDashboard from '@/components/admin/apps/AutomationDashboard'
import JobMonitor from '@/components/admin/apps/JobMonitor'
import TaskManager from '@/components/admin/apps/TaskManager'
import ApiKeyVault from '@/components/admin/apps/ApiKeyVault'
import CustomAppBuilder from '@/components/admin/apps/CustomAppBuilder'
import IntegrationHealthPanel from '@/components/admin/apps/IntegrationHealthPanel'
import UsageQuotasTracker from '@/components/admin/apps/UsageQuotasTracker'

type TabSection = 'integrations' | 'webhooks' | 'scripts' | 'automations' | 'jobs' | 'tasks' | 'vault' | 'custom' | 'health' | 'quotas'

export default function AppsPage() {
  const [activeTab, setActiveTab] = useState<TabSection>('integrations')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Run health checks on all integrations
  const runHealthChecks = async () => {
    setIsRefreshing(true)
    try {
      await fetch('/api/admin/apps/health', { method: 'POST' })
      // Trigger refresh of health panel
      window.dispatchEvent(new Event('refresh-health'))
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Global refresh
  const handleGlobalRefresh = () => {
    window.dispatchEvent(new Event('refresh-all'))
  }

  const tabs: { id: TabSection; label: string; icon: string }[] = [
    { id: 'integrations', label: 'Integrations', icon: '🧩' },
    { id: 'webhooks', label: 'Webhooks', icon: '🔗' },
    { id: 'scripts', label: 'Scripts', icon: '📜' },
    { id: 'automations', label: 'Automations', icon: '🚀' },
    { id: 'jobs', label: 'Jobs', icon: '⚙️' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'vault', label: 'Vault', icon: '🔐' },
    { id: 'custom', label: 'Custom Apps', icon: '🔨' },
    { id: 'health', label: 'Health', icon: '💚' },
    { id: 'quotas', label: 'Quotas', icon: '📊' },
  ]

  return (
    <>
      <Head>
        <title>Apps - TWR Admin</title>
      </Head>

      <AdminLayout title="Apps">
        <div className="max-w-[1600px] mx-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 -mx-6 px-6 py-4 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Apps & Integrations</h1>
                <p className="text-gray-400 mt-1">Manage external services, automations, and custom applications</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={runHealthChecks}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRefreshing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <span>🏥</span>
                      Run All Health Checks
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleGlobalRefresh}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                >
                  <span>🔄</span>
                  Refresh
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {activeTab === 'integrations' && <IntegrationManager />}
            {activeTab === 'webhooks' && <WebhookManager />}
            {activeTab === 'scripts' && <ScriptManager />}
            {activeTab === 'automations' && <AutomationDashboard />}
            {activeTab === 'jobs' && <JobMonitor />}
            {activeTab === 'tasks' && <TaskManager />}
            {activeTab === 'vault' && <ApiKeyVault />}
            {activeTab === 'custom' && <CustomAppBuilder />}
            {activeTab === 'health' && <IntegrationHealthPanel />}
            {activeTab === 'quotas' && <UsageQuotasTracker />}
          </div>
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          .scrollbar-thin::-webkit-scrollbar {
            height: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #4B5563;
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #6B7280;
          }
        `}</style>
      </AdminLayout>
    </>
  )
}