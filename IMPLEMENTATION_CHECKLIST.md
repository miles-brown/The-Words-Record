# Admin Apps - Implementation Checklist

Step-by-step guide to apply the baseline refactor to existing components.

---

## 📋 Phase 1: Apply Refactor to Existing Components

### Component 1: IntegrationManager.tsx

- [ ] 1.1 Import shared types
  ```tsx
  import type { Integration, IntegrationConfig } from '@/lib/apps/types'
  ```

- [ ] 1.2 Import shared utilities
  ```tsx
  import { getStatusColor, getProviderLogo } from '@/lib/appsUtils'
  ```

- [ ] 1.3 Import common components
  ```tsx
  import { LoadingSpinner, StatusBadge, Modal } from '@/components/admin/apps/components/common'
  ```

- [ ] 1.4 Replace loading spinner
  ```tsx
  // Before:
  <div className="flex items-center justify-center py-20">
    <div className="w-12 h-12 border-4..."></div>
  </div>

  // After:
  <LoadingSpinner />
  ```

- [ ] 1.5 Replace status badges
  ```tsx
  // Before:
  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
    {integration.status}
  </span>

  // After:
  <StatusBadge status={integration.status} />
  ```

- [ ] 1.6 Replace modal structure
  ```tsx
  // Before: Full div structure

  // After:
  <Modal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} title="Connect...">
    {/* Content */}
  </Modal>
  ```

- [ ] 1.7 Remove duplicate functions (getStatusColor, getProviderLogo)

- [ ] 1.8 Test functionality

---

### Component 2: WebhookManager.tsx

- [ ] 2.1 Import shared types
  ```tsx
  import type { Webhook } from '@/lib/apps/types'
  ```

- [ ] 2.2 Import shared utilities
  ```tsx
  import { getStatusColor, copyToClipboard } from '@/lib/appsUtils'
  ```

- [ ] 2.3 Import common components
  ```tsx
  import { LoadingSpinner, StatusBadge, ToggleSwitch, Modal } from '@/components/admin/apps/components/common'
  ```

- [ ] 2.4 Replace loading spinner

- [ ] 2.5 Replace status badges

- [ ] 2.6 Replace toggle switches
  ```tsx
  // Before: Button with div
  <button className={`w-12 h-6 rounded-full...`}>
    <div className={`w-5 h-5 bg-white...`} />
  </button>

  // After:
  <ToggleSwitch enabled={webhook.enabled} onChange={(enabled) => handleToggle(webhook.id, enabled)} />
  ```

- [ ] 2.7 Replace modals (create and test modals)

- [ ] 2.8 Remove duplicate functions (getStatusBadge, copyUrl)

- [ ] 2.9 Test functionality

---

### Component 3: ScriptManager.tsx

- [ ] 3.1 Import shared types
  ```tsx
  import type { Script } from '@/lib/apps/types'
  ```

- [ ] 3.2 Import shared utilities
  ```tsx
  import { parseCronSchedule, formatRelativeTime } from '@/lib/appsUtils'
  ```

- [ ] 3.3 Import common components
  ```tsx
  import { StatusBadge, ToggleSwitch, Modal } from '@/components/admin/apps/components/common'
  ```

- [ ] 3.4 Replace toggle switches

- [ ] 3.5 Replace status badges

- [ ] 3.6 Replace logs modal

- [ ] 3.7 Add human-readable cron display
  ```tsx
  {parseCronSchedule(script.schedule)}
  ```

- [ ] 3.8 Test functionality

---

### Component 4: AutomationDashboard.tsx

- [ ] 4.1 Import shared types
  ```tsx
  import type { Automation } from '@/lib/apps/types'
  ```

- [ ] 4.2 Import common components
  ```tsx
  import { StatusBadge, EmptyState } from '@/components/admin/apps/components/common'
  ```

- [ ] 4.3 Replace status badges

- [ ] 4.4 Add empty state if no automations

- [ ] 4.5 Test functionality

---

### Component 5: JobMonitor.tsx

- [ ] 5.1 Import shared types
  ```tsx
  import type { Job, JobMetrics } from '@/lib/apps/types'
  ```

- [ ] 5.2 Import shared utilities
  ```tsx
  import { getJobStatusColor, formatDuration } from '@/lib/appsUtils'
  ```

- [ ] 5.3 Import common components
  ```tsx
  import { StatusBadge, EmptyState } from '@/components/admin/apps/components/common'
  ```

- [ ] 5.4 Replace status badges

- [ ] 5.5 Add empty state for no jobs

- [ ] 5.6 Test functionality

---

### Component 6: TaskManager.tsx

- [ ] 6.1 Import shared types
  ```tsx
  import type { Task } from '@/lib/apps/types'
  ```

- [ ] 6.2 Import shared utilities
  ```tsx
  import { getTaskStatusColor, formatNextRun } from '@/lib/appsUtils'
  ```

- [ ] 6.3 Import common components
  ```tsx
  import { StatusBadge, EmptyState } from '@/components/admin/apps/components/common'
  ```

- [ ] 6.4 Replace status badges

- [ ] 6.5 Add formatted next run times

- [ ] 6.6 Add empty state

- [ ] 6.7 Test functionality

---

### Component 7: ApiKeyVault.tsx

- [ ] 7.1 Import shared types
  ```tsx
  import type { ApiKey } from '@/lib/apps/types'
  ```

- [ ] 7.2 Import shared utilities
  ```tsx
  import { maskSecret } from '@/lib/appsUtils'
  ```

- [ ] 7.3 Import common components
  ```tsx
  import { ToggleSwitch, Modal, ConfirmDialog } from '@/components/admin/apps/components/common'
  ```

- [ ] 7.4 Replace toggle switches

- [ ] 7.5 Replace create modal

- [ ] 7.6 Add delete confirmation dialog

- [ ] 7.7 Test functionality

---

### Component 8: CustomAppBuilder.tsx

- [ ] 8.1 Import shared types
  ```tsx
  import type { CustomApp } from '@/lib/apps/types'
  ```

- [ ] 8.2 Import common components
  ```tsx
  import { EmptyState, Modal } from '@/components/admin/apps/components/common'
  ```

- [ ] 8.3 Add empty state for no apps

- [ ] 8.4 Add create modal

- [ ] 8.5 Test functionality

---

### Component 9: IntegrationHealthPanel.tsx

- [ ] 9.1 Import shared types
  ```tsx
  import type { HealthCheck } from '@/lib/apps/types'
  ```

- [ ] 9.2 Import shared utilities
  ```tsx
  import { getStatusColor, getLatencyColor, getStatusIcon } from '@/lib/appsUtils'
  ```

- [ ] 9.3 Remove duplicate functions

- [ ] 9.4 Test functionality

---

### Component 10: UsageQuotasTracker.tsx

- [ ] 10.1 Import shared types
  ```tsx
  import type { Quota } from '@/lib/apps/types'
  ```

- [ ] 10.2 Import shared utilities
  ```tsx
  import { getUsageColor, getUsageBadgeColor, calculatePercentage } from '@/lib/appsUtils'
  ```

- [ ] 10.3 Remove duplicate functions

- [ ] 10.4 Test functionality

---

## 📋 Phase 2: Main Apps Page

### pages/admin/apps.tsx

- [ ] 11.1 Import shared types
  ```tsx
  import type { TabSection } from '@/lib/apps/types' // Add this type to types.ts
  ```

- [ ] 11.2 Verify admin.css classes are used
  ```tsx
  // Check for:
  .admin-section
  .admin-header
  .admin-title
  .admin-subtitle
  .admin-btn
  .admin-tabs-container
  .admin-tab
  ```

- [ ] 11.3 Consider adding SearchInput for filtering tabs

- [ ] 11.4 Test global refresh functionality

---

## 📋 Phase 3: API Endpoints

### Priority: High

- [ ] 12.1 Create `/api/admin/apps/webhooks/index.ts`
  - GET - List webhooks
  - POST - Create webhook

- [ ] 12.2 Create `/api/admin/apps/webhooks/[id].ts`
  - PATCH - Update webhook
  - DELETE - Delete webhook

- [ ] 12.3 Create `/api/admin/apps/webhooks/test.ts`
  - POST - Test webhook

- [ ] 12.4 Create `/api/admin/apps/scripts/index.ts`
  - GET - List scripts
  - POST - Create script

- [ ] 12.5 Create `/api/admin/apps/scripts/run.ts`
  - POST - Run script

- [ ] 12.6 Create `/api/admin/apps/vault/index.ts`
  - GET - List API keys
  - POST - Create API key

- [ ] 12.7 Create `/api/admin/apps/vault/[id]/rotate.ts`
  - POST - Rotate key

### Priority: Medium

- [ ] 13.1 Create Jobs endpoints
- [ ] 13.2 Create Tasks endpoints
- [ ] 13.3 Create Automations endpoints

### Priority: Low

- [ ] 14.1 Create Custom Apps endpoints
- [ ] 14.2 Create Quotas endpoints

---

## 📋 Phase 4: Styling Improvements

- [ ] 15.1 Replace button classes with admin.css
  ```tsx
  // Before:
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

  // After:
  className="admin-btn admin-btn-primary"
  ```

- [ ] 15.2 Replace card classes
  ```tsx
  // Before:
  className="bg-gray-800 rounded-2xl shadow-lg p-6"

  // After:
  className="admin-card"
  ```

- [ ] 15.3 Replace table classes

- [ ] 15.4 Test dark mode compatibility

---

## 📋 Phase 5: State Management (Optional)

- [ ] 16.1 Install Zustand
  ```bash
  npm install zustand
  ```

- [ ] 16.2 Create apps store
  ```tsx
  // lib/apps/store.ts
  import create from 'zustand'

  interface AppsState {
    integrations: Integration[]
    webhooks: Webhook[]
    // etc...
  }

  export const useAppsStore = create<AppsState>(...)
  ```

- [ ] 16.3 Migrate components to use store

- [ ] 16.4 Remove local state where appropriate

---

## 📋 Phase 6: Routing (Optional)

- [ ] 17.1 Create sub-routes
  ```
  pages/admin/apps/
  ├── index.tsx (redirect to integrations)
  ├── integrations.tsx
  ├── webhooks.tsx
  ├── scripts.tsx
  ├── automations.tsx
  ├── jobs.tsx
  ├── tasks.tsx
  ├── vault.tsx
  ├── custom.tsx
  ├── health.tsx
  └── quotas.tsx
  ```

- [ ] 17.2 Update navigation to use Next.js Link

- [ ] 17.3 Test URL navigation

- [ ] 17.4 Add breadcrumbs

---

## 📋 Phase 7: Testing

- [ ] 18.1 Test all components load correctly

- [ ] 18.2 Test all modals open/close

- [ ] 18.3 Test all toggles work

- [ ] 18.4 Test all API calls (once implemented)

- [ ] 18.5 Test error states

- [ ] 18.6 Test loading states

- [ ] 18.7 Test empty states

- [ ] 18.8 Test search functionality (where applicable)

- [ ] 18.9 Test mobile responsiveness

- [ ] 18.10 Test keyboard navigation

- [ ] 18.11 Test screen reader compatibility

---

## 📋 Phase 8: Documentation

- [ ] 19.1 Update component JSDoc comments

- [ ] 19.2 Document API endpoints as they're implemented

- [ ] 19.3 Update README with new architecture

- [ ] 19.4 Create API client usage guide

- [ ] 19.5 Document state management approach

---

## 🎯 Quick Wins (Start Here)

These changes provide immediate value with minimal risk:

1. **Replace LoadingSpinner** (10 minutes)
   - Find: `<div className="flex items-center justify-center py-20">`
   - Replace with: `<LoadingSpinner />`

2. **Replace ToggleSwitches** (15 minutes)
   - Find: `<button.*w-12 h-6 rounded-full`
   - Replace with: `<ToggleSwitch .../>`

3. **Add EmptyStates** (20 minutes)
   - Find empty array conditions
   - Add: `<EmptyState .../>`

4. **Import shared types** (5 minutes per component)
   - Add imports at top of each file
   - Update type annotations

---

## 🚀 Recommended Order

1. Start with **AutomationDashboard** (simplest component)
2. Then **TaskManager** (similar complexity)
3. Then **CustomAppBuilder** (similar complexity)
4. Then **ApiKeyVault** (adds modals)
5. Then **ScriptManager** (more complex)
6. Then **WebhookManager** (most complex)
7. Then **IntegrationManager** (most complex)
8. Then **JobMonitor**
9. Then **IntegrationHealthPanel**
10. Finally **UsageQuotasTracker**

This order gradually increases complexity so you can learn the patterns before tackling the hardest components.

---

## ✅ Success Criteria

The refactor is successful when:

- ✅ All components use shared types from `lib/apps/types.ts`
- ✅ All components use utilities from `lib/appsUtils.ts`
- ✅ No duplicate function definitions across components
- ✅ All loading states use `<LoadingSpinner />`
- ✅ All toggles use `<ToggleSwitch />`
- ✅ All modals use `<Modal />` or `<ConfirmDialog />`
- ✅ All status displays use `<StatusBadge />`
- ✅ Empty states show helpful messages with actions
- ✅ All functionality still works as before
- ✅ Code is more maintainable and DRY

---

## 📊 Progress Tracking

Copy this to track your progress:

```
Component Refactors: [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
API Endpoints: [ ] [ ] [ ] [ ] [ ] [ ]
Styling Updates: [ ] [ ] [ ]
Testing: [ ] [ ] [ ]
```

---

## 🆘 Troubleshooting

### Import errors
```
Error: Cannot find module '@/lib/apps/types'
```
**Fix:** Ensure `tsconfig.json` has path aliases configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Type errors
```
Error: Type 'Integration' is not assignable to type 'Integration'
```
**Fix:** Remove old interface definition, use imported one.

### Component not updating
**Fix:** Check that props are passed correctly to common components.

### Modal not closing
**Fix:** Ensure `onClose` handler updates state correctly.

---

## 📝 Notes

- Each component refactor should take 15-30 minutes
- Test immediately after each change
- Commit frequently with descriptive messages
- If stuck, refer to examples in `components/admin/apps/components/common/README.md`

---

## 🎉 When Complete

You'll have:
- 📦 Fully modular, DRY codebase
- 🎨 Consistent UI components
- 📐 Type-safe code throughout
- 📚 Well-documented architecture
- 🚀 Foundation ready for rapid feature development

**Estimated Time:** 4-6 hours for complete refactor
**Benefit:** 20+ hours saved in future development and maintenance
