"use client"

import type { ReactNode, MouseEvent } from "react"

export interface ToolbarAction {
  icon: ReactNode
  onClick: (e: MouseEvent) => void
  title: string
  variant?: 'default' | 'danger'
  isActive?: boolean
}

interface PhotoToolbarProps {
  actions: ToolbarAction[]
}

export function PhotoToolbar({ actions }: PhotoToolbarProps) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-md shadow-md px-1.5 py-1 z-40"
      style={{ bottom: 'calc(100% + 4px)' }}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`p-1.5 rounded transition-colors ${
            action.isActive
              ? 'bg-gray-200'
              : action.variant === 'danger'
                ? 'hover:bg-red-50'
                : 'hover:bg-gray-100'
          }`}
          style={{ color: 'var(--color-accent)' }}
          title={action.title}
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}
