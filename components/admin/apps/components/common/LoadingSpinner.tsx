/**
 * LoadingSpinner Component
 * Reusable loading spinner for the Apps module
 */

import React from 'react'
import type { LoadingSpinnerProps } from '@/lib/apps/types'

export default function LoadingSpinner({
  size = 'md',
  color = 'blue-500',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  }

  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-gray-600 border-t-${color} rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
