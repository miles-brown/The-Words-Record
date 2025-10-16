/**
 * StatusBadge Component
 * Reusable status badge with consistent styling
 */

import React from 'react'
import { getStatusColor, getStatusIcon } from '@/lib/appsUtils'
import type { StatusBadgeProps } from '@/lib/apps/types'

export default function StatusBadge({
  status,
  variant = 'default',
  size = 'md'
}: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const colorClass = getStatusColor(status)
  const icon = getStatusIcon(status)

  if (variant === 'outline') {
    return (
      <span
        className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full font-medium border ${colorClass}`}
      >
        {icon && <span className="opacity-75">{icon}</span>}
        {status}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full font-medium border ${colorClass}`}
    >
      {status}
    </span>
  )
}
