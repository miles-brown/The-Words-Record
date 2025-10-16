/**
 * ToggleSwitch Component
 * Reusable toggle switch with consistent styling
 */

import React from 'react'
import type { ToggleSwitchProps } from '@/lib/apps/types'

export default function ToggleSwitch({
  enabled,
  onChange,
  disabled = false,
  size = 'md'
}: ToggleSwitchProps) {
  const sizeConfig = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: enabled ? 'translate-x-4' : 'translate-x-0.5'
    },
    md: {
      track: 'w-12 h-6',
      thumb: 'w-5 h-5',
      translate: enabled ? 'translate-x-6' : 'translate-x-0.5'
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: enabled ? 'translate-x-7' : 'translate-x-0.5'
    }
  }

  const config = sizeConfig[size]

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        ${config.track}
        rounded-full
        transition-colors
        ${enabled ? 'bg-green-600' : 'bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
      `}
      role="switch"
      aria-checked={enabled}
      aria-label="Toggle switch"
    >
      <div
        className={`
          ${config.thumb}
          bg-white
          rounded-full
          transition-transform
          ${config.translate}
        `}
      />
    </button>
  )
}
