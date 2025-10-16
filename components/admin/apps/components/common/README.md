# Admin Apps - Common Components

Reusable UI components for the Admin Apps module.

## Usage

```tsx
import {
  LoadingSpinner,
  StatusBadge,
  ToggleSwitch,
  Modal,
  EmptyState,
  ConfirmDialog,
  SearchInput
} from '@/components/admin/apps/components/common'
```

---

## LoadingSpinner

Consistent loading spinner across all tabs.

```tsx
<LoadingSpinner size="md" color="blue-500" />
```

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Spinner size (default: 'md')
- `color?: string` - Tailwind color class (default: 'blue-500')
- `className?: string` - Additional classes

---

## StatusBadge

Auto-colored status badge using centralized color scheme.

```tsx
<StatusBadge status="connected" variant="outline" size="md" />
```

**Props:**
- `status: string` - Status text (auto-colored)
- `variant?: 'default' | 'outline' | 'solid'` - Badge style (default: 'default')
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: 'md')

**Auto Colors:**
- `ok`, `connected` → Green
- `error` → Red
- `timeout`, `warning` → Yellow/Orange
- `disconnected` → Gray

---

## ToggleSwitch

Accessible toggle switch with smooth animations.

```tsx
<ToggleSwitch
  enabled={isEnabled}
  onChange={setEnabled}
  size="md"
  disabled={false}
/>
```

**Props:**
- `enabled: boolean` - Current state
- `onChange: (enabled: boolean) => void` - Change handler
- `size?: 'sm' | 'md' | 'lg'` - Switch size (default: 'md')
- `disabled?: boolean` - Disable interaction (default: false)

**Features:**
- Keyboard accessible (Space/Enter)
- Screen reader friendly (ARIA labels)
- Smooth animations

---

## Modal

Full-featured modal with keyboard support and scroll lock.

```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Create Webhook"
  size="md"
>
  <div>Modal content here</div>
</Modal>
```

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `title: string` - Modal title
- `children: React.ReactNode` - Modal content
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Modal width (default: 'md')

**Features:**
- Escape key to close
- Click outside to close
- Body scroll lock when open
- Keyboard accessible
- Smooth animations

---

## EmptyState

Consistent empty state display with optional action.

```tsx
<EmptyState
  icon="📭"
  title="No webhooks configured"
  description="Create your first webhook to get started"
  action={{
    label: "Create Webhook",
    onClick: handleCreate
  }}
/>
```

**Props:**
- `icon?: string` - Emoji or icon (default: '📭')
- `title: string` - Main message
- `description?: string` - Optional description text
- `action?: { label: string; onClick: () => void }` - Optional action button

---

## ConfirmDialog

Confirmation dialog built on Modal component.

```tsx
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Webhook?"
  message="This action cannot be undone. Are you sure?"
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
/>
```

**Props:**
- `isOpen: boolean` - Dialog visibility
- `onClose: () => void` - Close handler
- `onConfirm: () => void` - Confirm handler (auto-closes after)
- `title: string` - Dialog title
- `message: string` - Confirmation message
- `confirmText?: string` - Confirm button text (default: 'Confirm')
- `cancelText?: string` - Cancel button text (default: 'Cancel')
- `variant?: 'danger' | 'warning' | 'info'` - Button color (default: 'info')

**Variants:**
- `danger` - Red button (for destructive actions)
- `warning` - Yellow button (for risky actions)
- `info` - Blue button (for safe actions)

---

## SearchInput

Search input with icon and clear button.

```tsx
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search webhooks..."
  className="w-full"
/>
```

**Props:**
- `value: string` - Current search value
- `onChange: (value: string) => void` - Change handler
- `placeholder?: string` - Input placeholder (default: 'Search...')
- `className?: string` - Additional classes

**Features:**
- Search icon on left
- Clear button (X) appears when value exists
- Keyboard accessible

---

## Example: Complete Component

```tsx
import { useState } from 'react'
import {
  LoadingSpinner,
  StatusBadge,
  ToggleSwitch,
  Modal,
  EmptyState,
  ConfirmDialog,
  SearchInput
} from '@/components/admin/apps/components/common'
import type { Webhook } from '@/lib/apps/types'
import { getStatusColor } from '@/lib/appsUtils'

export default function WebhookList() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Loading state
  if (loading) return <LoadingSpinner size="lg" />

  // Empty state
  if (webhooks.length === 0) {
    return (
      <EmptyState
        icon="🔗"
        title="No webhooks configured"
        description="Create your first webhook to start receiving events"
        action={{
          label: "Create Webhook",
          onClick: () => setShowCreate(true)
        }}
      />
    )
  }

  // List with search
  const filtered = webhooks.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search webhooks..."
      />

      {/* List */}
      <div className="space-y-4">
        {filtered.map(webhook => (
          <div key={webhook.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">{webhook.name}</h3>
                <StatusBadge status={webhook.lastStatus || 'unknown'} />
              </div>
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  enabled={webhook.enabled}
                  onChange={(enabled) => handleToggle(webhook.id, enabled)}
                />
                <button
                  onClick={() => {
                    setSelectedId(webhook.id)
                    setShowDelete(true)
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Webhook"
        size="md"
      >
        {/* Form content */}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => handleDelete(selectedId!)}
        title="Delete Webhook?"
        message="This action cannot be undone. All event history will be lost."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
```

---

## Styling

All components use:
- Tailwind CSS for utilities
- Dark theme (gray-800, gray-700 backgrounds)
- Blue accent colors (blue-600, blue-700)
- Consistent spacing and transitions

To customize globally, update the components in this directory.

---

## Accessibility

All components include:
- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus indicators
- ✅ Semantic HTML

---

## Future Additions

Potential components to add:
- `<Table />` - Data table with sorting
- `<Pagination />` - Page navigation
- `<Toast />` - Notification system
- `<Dropdown />` - Dropdown menu
- `<Tabs />` - Tab navigation
- `<Card />` - Content card
- `<Button />` - Button variants
- `<Input />` - Form inputs
