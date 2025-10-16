/**
 * TWR Admin Apps - Shared Utilities
 * Common functions used across the Apps module
 */

import { useEffect } from 'react'
import type { Status, JobStatus, TaskStatus } from './apps/types'

// ==================== Status Color Utilities ====================

/**
 * Get Tailwind color classes for connection/health status
 */
export function getStatusColor(status: Status | string): string {
  const statusMap: Record<string, string> = {
    ok: 'bg-green-900/50 text-green-400 border-green-800',
    connected: 'bg-green-900/50 text-green-400 border-green-800',
    error: 'bg-red-900/50 text-red-400 border-red-800',
    disconnected: 'bg-gray-900/50 text-gray-400 border-gray-800',
    timeout: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    warning: 'bg-orange-900/50 text-orange-400 border-orange-800',
    degraded: 'bg-orange-900/50 text-orange-400 border-orange-800',
  }
  return statusMap[status] || statusMap.disconnected
}

/**
 * Get admin.css class for status badges
 */
export function getAdminStatusBadge(status: Status | string): string {
  const badgeMap: Record<string, string> = {
    ok: 'admin-badge admin-badge-success',
    connected: 'admin-badge admin-badge-success',
    error: 'admin-badge admin-badge-error',
    disconnected: 'admin-badge admin-badge-info',
    timeout: 'admin-badge admin-badge-warning',
    warning: 'admin-badge admin-badge-warning',
  }
  return badgeMap[status] || 'admin-badge admin-badge-info'
}

/**
 * Get color class for job status
 */
export function getJobStatusColor(status: JobStatus): string {
  const statusMap: Record<JobStatus, string> = {
    completed: 'bg-green-900/50 text-green-400 border-green-800',
    active: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    failed: 'bg-red-900/50 text-red-400 border-red-800',
    queued: 'bg-blue-900/50 text-blue-400 border-blue-800',
    delayed: 'bg-gray-900/50 text-gray-400 border-gray-800',
    cancelled: 'bg-gray-900/50 text-gray-400 border-gray-800',
  }
  return statusMap[status] || statusMap.queued
}

/**
 * Get color class for task status
 */
export function getTaskStatusColor(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    running: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    completed: 'bg-green-900/50 text-green-400 border-green-800',
    failed: 'bg-red-900/50 text-red-400 border-red-800',
    paused: 'bg-gray-700 text-gray-400',
    idle: 'bg-gray-700 text-gray-300',
  }
  return statusMap[status] || statusMap.idle
}

// ==================== Latency Color Utilities ====================

/**
 * Get color class based on latency (in milliseconds)
 */
export function getLatencyColor(ms: number): string {
  if (ms < 50) return 'text-green-400'
  if (ms < 200) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * Get background color class based on latency
 */
export function getLatencyBgColor(ms: number): string {
  if (ms < 50) return 'bg-green-500'
  if (ms < 200) return 'bg-yellow-500'
  return 'bg-red-500'
}

// ==================== Usage/Quota Utilities ====================

/**
 * Get color class for usage percentage
 */
export function getUsageColor(percentage: number): string {
  if (percentage < 50) return 'bg-green-500'
  if (percentage < 80) return 'bg-yellow-500'
  if (percentage < 95) return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * Get badge color class for usage percentage
 */
export function getUsageBadgeColor(percentage: number): string {
  if (percentage < 50) return 'bg-green-900/50 text-green-400 border-green-800'
  if (percentage < 80) return 'bg-yellow-900/50 text-yellow-400 border-yellow-800'
  if (percentage < 95) return 'bg-orange-900/50 text-orange-400 border-orange-800'
  return 'bg-red-900/50 text-red-400 border-red-800'
}

/**
 * Get usage alert level
 */
export function getUsageAlertLevel(percentage: number): 'safe' | 'warning' | 'critical' {
  if (percentage < 80) return 'safe'
  if (percentage < 95) return 'warning'
  return 'critical'
}

// ==================== Status Icon Utilities ====================

/**
 * Get icon for status (emoji-based)
 */
export function getStatusIcon(status: Status | string): string {
  const iconMap: Record<string, string> = {
    ok: '✓',
    connected: '✓',
    error: '✗',
    timeout: '⚠',
    warning: '⚠',
    disconnected: '○',
  }
  return iconMap[status] || '○'
}

/**
 * Get provider logo/icon
 */
export function getProviderLogo(provider: string): string {
  const logoMap: Record<string, string> = {
    supabase: '🗄️',
    gmail: '📧',
    discord: '💬',
    openai: '🤖',
    vercel: '▲',
    cloudflare: '☁️',
    github: '🐙',
    slack: '💬',
    stripe: '💳',
    aws: '☁️',
    gcp: '☁️',
    azure: '☁️',
  }
  return logoMap[provider.toLowerCase()] || '🔌'
}

// ==================== Date/Time Utilities ====================

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  return then.toLocaleDateString()
}

/**
 * Format next run time
 */
export function formatNextRun(date: string | Date): string {
  const now = new Date()
  const then = typeof date === 'string' ? new Date(date) : date
  const diffMs = then.getTime() - now.getTime()

  if (diffMs < 0) return 'Overdue'

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 60) return `in ${diffMin} minute${diffMin > 1 ? 's' : ''}`
  if (diffHour < 24) return `in ${diffHour} hour${diffHour > 1 ? 's' : ''}`
  return `in ${diffDay} day${diffDay > 1 ? 's' : ''}`
}

/**
 * Parse cron schedule to human-readable format
 */
export function parseCronSchedule(cron: string): string {
  // Simple parser for common cron patterns
  const patterns: Record<string, string> = {
    '0 0 * * *': 'Daily at midnight',
    '0 9 * * *': 'Daily at 9:00 AM',
    '0 */6 * * *': 'Every 6 hours',
    '0 0 * * MON': 'Every Monday at midnight',
    '*/5 * * * *': 'Every 5 minutes',
    '0 0 1 * *': 'Monthly on the 1st',
  }

  return patterns[cron] || cron
}

// ==================== Validation Utilities ====================

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate cron expression (basic)
 */
export function isValidCron(cron: string): boolean {
  const parts = cron.trim().split(/\s+/)
  return parts.length === 5 || parts.length === 6
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ==================== Formatting Utilities ====================

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format duration in milliseconds to readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}

/**
 * Mask secret (show last N characters)
 */
export function maskSecret(secret: string, visibleChars: number = 4): string {
  if (secret.length <= visibleChars) return secret
  return '****' + secret.slice(-visibleChars)
}

// ==================== Copy to Clipboard ====================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

// ==================== Custom Hooks ====================

/**
 * Hook to listen for refresh events
 */
export function useRefreshListener(callback: () => void, eventName: string = 'refresh-all') {
  useEffect(() => {
    window.addEventListener(eventName, callback)
    return () => window.removeEventListener(eventName, callback)
  }, [callback, eventName])
}

/**
 * Hook to trigger refresh events
 */
export function useRefreshTrigger() {
  return (eventName: string = 'refresh-all') => {
    window.dispatchEvent(new Event(eventName))
  }
}

// ==================== API Utilities ====================

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value))
    }
  })
  return query.toString()
}

/**
 * Handle API error response
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  return 'An unexpected error occurred'
}

// ==================== Calculation Utilities ====================

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100 * 10) / 10 // Round to 1 decimal
}

/**
 * Calculate success rate
 */
export function calculateSuccessRate(successful: number, total: number): number {
  return calculatePercentage(successful, total)
}

/**
 * Calculate average
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((a, b) => a + b, 0)
  return Math.round(sum / numbers.length * 10) / 10
}

// ==================== Sort/Filter Utilities ====================

/**
 * Sort array by property
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Filter array by search term
 */
export function filterBySearch<T extends Record<string, any>>(
  array: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
): T[] {
  if (!searchTerm) return array
  const lowerSearch = searchTerm.toLowerCase()
  return array.filter(item =>
    searchKeys.some(key => {
      const value = item[key]
      return value && String(value).toLowerCase().includes(lowerSearch)
    })
  )
}
