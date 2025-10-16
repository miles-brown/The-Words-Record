/**
 * Apps Module - Zustand Store
 * Centralized state management for the Apps & Integrations module
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppTab =
  | 'integrations'
  | 'webhooks'
  | 'scripts'
  | 'automations'
  | 'jobs'
  | 'tasks'
  | 'vault'
  | 'custom'
  | 'health'
  | 'quotas'

export interface TabConfig {
  id: AppTab
  label: string
  emoji: string
  path: string
}

export const TAB_CONFIGS: TabConfig[] = [
  { id: 'integrations', label: 'Integrations', emoji: '🔗', path: '/admin/apps/integrations' },
  { id: 'webhooks', label: 'Webhooks', emoji: '🪝', path: '/admin/apps/webhooks' },
  { id: 'scripts', label: 'Scripts', emoji: '⚙️', path: '/admin/apps/scripts' },
  { id: 'automations', label: 'Automations', emoji: '🚀', path: '/admin/apps/automations' },
  { id: 'jobs', label: 'Jobs', emoji: '💼', path: '/admin/apps/jobs' },
  { id: 'tasks', label: 'Tasks', emoji: '✅', path: '/admin/apps/tasks' },
  { id: 'vault', label: 'Vault', emoji: '🔐', path: '/admin/apps/vault' },
  { id: 'custom', label: 'Custom Apps', emoji: '🧩', path: '/admin/apps/custom' },
  { id: 'health', label: 'Health', emoji: '💚', path: '/admin/apps/health' },
  { id: 'quotas', label: 'Quotas', emoji: '📊', path: '/admin/apps/quotas' },
]

interface AppsStore {
  // Current active tab
  activeTab: AppTab

  // Set active tab
  setActiveTab: (tab: AppTab) => void

  // Get tab config by id
  getTabConfig: (tabId: AppTab) => TabConfig | undefined

  // Get all tabs
  getAllTabs: () => TabConfig[]
}

export const useAppsStore = create<AppsStore>()(
  persist(
    (set, get) => ({
      // Default to integrations tab
      activeTab: 'integrations',

      setActiveTab: (tab: AppTab) => {
        set({ activeTab: tab })
      },

      getTabConfig: (tabId: AppTab) => {
        return TAB_CONFIGS.find(tab => tab.id === tabId)
      },

      getAllTabs: () => {
        return TAB_CONFIGS
      },
    }),
    {
      name: 'apps-store', // Name for localStorage key
      partialize: (state) => ({ activeTab: state.activeTab }), // Only persist activeTab
      skipHydration: typeof window === 'undefined', // Skip hydration on server
    }
  )
)

// Helper hook for tab navigation
export const useTabNavigation = () => {
  const { activeTab, setActiveTab, getAllTabs, getTabConfig } = useAppsStore()

  return {
    activeTab,
    setActiveTab,
    getAllTabs,
    getTabConfig,
    isActive: (tabId: AppTab) => activeTab === tabId,
  }
}
