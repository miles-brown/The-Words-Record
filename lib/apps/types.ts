/**
 * TWR Admin Apps - Shared Type Definitions
 * Centralized TypeScript interfaces for the Apps module
 */

// ==================== Common Types ====================

export type Status = 'ok' | 'connected' | 'disconnected' | 'error' | 'timeout' | 'warning'
export type EnabledStatus = 'active' | 'enabled' | 'disabled' | 'paused' | 'idle' | 'running'

// ==================== Integrations ====================

export interface Integration {
  id: string
  provider: string
  name: string
  description?: string
  status: 'connected' | 'disconnected' | 'error'
  logo?: string
  lastPing?: number
  config?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface IntegrationField {
  name: string
  label: string
  type: 'text' | 'password' | 'url' | 'email' | 'number'
  required?: boolean
  placeholder?: string
}

export interface IntegrationProvider {
  name: string
  fields: IntegrationField[]
}

export type IntegrationConfig = Record<string, IntegrationProvider>

// ==================== Webhooks ====================

export interface Webhook {
  id: string
  direction: 'incoming' | 'outgoing'
  name: string
  url: string
  secretLast4?: string
  enabled: boolean
  lastStatus?: string
  lastFired?: string
  createdAt: string
  updatedAt: string
}

export interface WebhookTestPayload {
  event: string
  data: any
}

export interface WebhookTestResult {
  success: boolean
  status?: number
  latency?: number
  error?: string
  response?: any
}

// ==================== Scripts ====================

export interface Script {
  id: string
  name: string
  description?: string
  schedule?: string // Cron expression
  codeRef: string
  enabled: boolean
  lastRunAt?: string
  lastRunStatus?: 'ok' | 'error'
  nextRunAt?: string
  createdAt: string
  updatedAt: string
}

export interface ScriptLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

// ==================== Automations ====================

export interface Automation {
  id: string
  name: string
  description?: string
  trigger: string // e.g., 'event:user.created' or 'cron:0 9 * * *'
  enabled: boolean
  lastRun?: string
  lastStatus?: 'ok' | 'error' | 'skipped'
  actions?: AutomationAction[]
  createdAt: string
  updatedAt: string
}

export interface AutomationAction {
  type: 'webhook' | 'email' | 'script' | 'notification'
  config: Record<string, any>
}

// ==================== Jobs ====================

export type JobStatus = 'queued' | 'active' | 'completed' | 'failed' | 'delayed' | 'cancelled'

export interface Job {
  id: string
  queue: string
  status: JobStatus
  attempts: number
  maxAttempts?: number
  payload: any
  error?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  failedAt?: string
}

export interface JobMetrics {
  queued: number
  active: number
  completed: number
  failed: number
  delayed: number
}

// ==================== Tasks ====================

export type TaskType = 'scheduled' | 'manual' | 'recurring' | 'one-time'
export type TaskStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed'

export interface Task {
  id: string
  name: string
  description?: string
  type: TaskType
  status: TaskStatus
  schedule?: string // Cron expression for scheduled tasks
  lastRun?: string
  nextRun?: string
  createdAt: string
  updatedAt: string
}

// ==================== API Keys / Vault ====================

export interface ApiKey {
  id: string
  label: string
  scope: string // e.g., 'api:production', 'integration:openai'
  last4: string
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
  enabled: boolean
  expiresAt?: string
}

export interface ApiKeyCreate {
  label: string
  scope: string
  secret: string
  expiresAt?: string
}

// ==================== Custom Apps ====================

export interface CustomApp {
  id: string
  name: string
  description?: string
  icon?: string
  inputs: CustomAppInput[]
  code?: string
  lastRun?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomAppInput {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file'
  required?: boolean
  options?: string[]
  defaultValue?: any
}

// ==================== Health & Monitoring ====================

export interface HealthCheck {
  provider: string
  status: 'ok' | 'error' | 'timeout' | 'degraded'
  latencyMs: number
  checkedAt: string
  message?: string
  metadata?: Record<string, any>
}

export interface SystemHealth {
  overall: number // Percentage
  checks: HealthCheck[]
  lastUpdated: string
}

// ==================== Usage & Quotas ====================

export interface Quota {
  provider: string
  unit: string
  used: number
  limit: number
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  resetAt: string
}

export interface QuotaSummary {
  atRisk: number // Count of services >= 80% usage
  averageUsage: number // Percentage
  totalServices: number
}

// ==================== UI/Component Props ====================

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'outline' | 'solid'
  size?: 'sm' | 'md' | 'lg'
}

export interface ToggleSwitchProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ==================== Form Types ====================

export interface FormField {
  name: string
  label: string
  type: string
  value: any
  error?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
}

export interface FormState {
  fields: Record<string, FormField>
  isSubmitting: boolean
  isValid: boolean
  errors: Record<string, string>
}

// ==================== Filter & Sort ====================

export interface FilterOption {
  label: string
  value: string | number | boolean
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
}

export interface TableFilters {
  search?: string
  status?: string[]
  dateRange?: {
    start: string
    end: string
  }
  sort?: SortOption
}
