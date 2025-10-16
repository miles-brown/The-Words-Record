/**
 * AppsLayout Component
 * Unified layout for Apps & Integrations with tab navigation and top-level controls
 */

import { useState } from 'react'
import TabsNavigation from './components/TabsNavigation'
import { useTabNavigation } from '@/lib/apps/store'

// Import all submodule components
import IntegrationManager from './IntegrationManager'
import WebhookManager from './WebhookManager'
import ScriptManager from './ScriptManager'
import AutomationDashboard from './AutomationDashboard'
import JobMonitor from './JobMonitor'
import TaskManager from './TaskManager'
import ApiKeyVault from './ApiKeyVault'
import CustomAppBuilder from './CustomAppBuilder'
import IntegrationHealthPanel from './IntegrationHealthPanel'
import UsageQuotasTracker from './UsageQuotasTracker'

export default function AppsLayout() {
  const { activeTab } = useTabNavigation()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRunningHealthChecks, setIsRunningHealthChecks] = useState(false)

  /**
   * Run health checks on all integrations
   */
  const handleRunHealthChecks = async () => {
    setIsRunningHealthChecks(true)
    try {
      const response = await fetch('/api/apps/health', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Health checks completed:', data)
        // Trigger refresh event for health panel
        window.dispatchEvent(new CustomEvent('refresh-health', { detail: data }))
      } else {
        console.error('❌ Health check failed:', response.statusText)
      }
    } catch (error) {
      console.error('❌ Health check error:', error)
    } finally {
      setIsRunningHealthChecks(false)
    }
  }

  /**
   * Refresh all data across submodules
   */
  const handleRefresh = () => {
    setIsRefreshing(true)
    // Dispatch global refresh event that submodules can listen to
    window.dispatchEvent(new Event('refresh-all'))
    console.log('🔄 Refresh triggered for all submodules')
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  /**
   * Render the active submodule component
   */
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'integrations':
        return <IntegrationManager />
      case 'webhooks':
        return <WebhookManager />
      case 'scripts':
        return <ScriptManager />
      case 'automations':
        return <AutomationDashboard />
      case 'jobs':
        return <JobMonitor />
      case 'tasks':
        return <TaskManager />
      case 'vault':
        return <ApiKeyVault />
      case 'custom':
        return <CustomAppBuilder />
      case 'health':
        return <IntegrationHealthPanel />
      case 'quotas':
        return <UsageQuotasTracker />
      default:
        return (
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-gray-500">Component not found for tab: {activeTab}</p>
          </div>
        )
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--admin-bg)' }}>
      {/* Page Header with Action Buttons */}
      <div style={{
        backgroundColor: 'var(--admin-card-bg)',
        borderBottom: '1px solid var(--admin-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            paddingBottom: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--admin-text-primary)',
                marginBottom: '0.25rem'
              }}>
                Apps & Integrations
              </h1>
              <p className="admin-text-sm" style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>
                Manage external services, automations, and custom applications
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Run Health Checks Button */}
              <button
                type="button"
                onClick={handleRunHealthChecks}
                disabled={isRunningHealthChecks}
                className="admin-btn admin-btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isRunningHealthChecks ? 0.6 : 1,
                  cursor: isRunningHealthChecks ? 'not-allowed' : 'pointer'
                }}
                aria-label="Run health checks on all integrations"
              >
                {isRunningHealthChecks ? (
                  <>
                    <svg
                      style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        style={{ opacity: 0.25 }}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        style={{ opacity: 0.75 }}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <svg
                      style={{ width: '1rem', height: '1rem' }}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Run Health Checks</span>
                  </>
                )}
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="admin-btn admin-btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isRefreshing ? 0.6 : 1,
                  cursor: isRefreshing ? 'not-allowed' : 'pointer'
                }}
                aria-label="Refresh all data"
              >
                <svg
                  style={{
                    width: '1rem',
                    height: '1rem',
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Sticky beneath header */}
        <TabsNavigation />
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Main Content Area */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ transition: 'opacity 0.2s' }}>
          {/* Dynamic Component Rendering */}
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  )
}
