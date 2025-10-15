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
        <div className="admin-section">
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Apps & Integrations</h1>
              <p className="admin-subtitle">Manage external services, automations, and custom applications</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={runHealthChecks}
                disabled={isRefreshing}
                className="admin-btn admin-btn-success"
              >
                {isRefreshing ? (
                  <>
                    <div className="admin-spinner"></div>
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
                className="admin-btn admin-btn-secondary"
              >
                <span>🔄</span>
                Refresh
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="admin-tabs-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`admin-tab ${activeTab === tab.id ? 'admin-tab-active' : ''}`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="admin-content-section">
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
      </AdminLayout>
    </>
  )
}