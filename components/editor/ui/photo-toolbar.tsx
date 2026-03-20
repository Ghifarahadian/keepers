"use client"

import { useCallback } from "react"
import { Move, ZoomIn, ZoomOut, ImageMinus, Trash2 } from "lucide-react"

interface PhotoToolbarProps {
  isEmpty: boolean
  isPanMode: boolean
  onTogglePanMode: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onRemovePhoto: () => void
  onDeleteZone: () => void
}

export function PhotoToolbar({
  isEmpty,
  isPanMode,
  onTogglePanMode,
  onZoomIn,
  onZoomOut,
  onRemovePhoto,
  onDeleteZone,
}: PhotoToolbarProps) {
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const actions = [
    {
      icon: <Move className="w-4 h-4" />,
      title: isPanMode ? "Move zone (click to switch)" : "Move photo (click to switch)",
      onClick: onTogglePanMode,
      isActive: isPanMode,
      disabled: isEmpty,
    },
    {
      icon: <ZoomIn className="w-4 h-4" />,
      title: "Zoom in",
      onClick: onZoomIn,
      disabled: isEmpty,
    },
    {
      icon: <ZoomOut className="w-4 h-4" />,
      title: "Zoom out",
      onClick: onZoomOut,
      disabled: isEmpty,
    },
    {
      icon: <ImageMinus className="w-4 h-4" />,
      title: "Remove photo",
      onClick: onRemovePhoto,
      disabled: isEmpty,
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      title: "Delete zone",
      onClick: onDeleteZone,
      variant: "danger" as const,
    },
  ]

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-md shadow-md px-1.5 py-1 z-40"
      style={{ bottom: 'calc(100% + 4px)' }}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.disabled ? undefined : (e) => { e.stopPropagation(); action.onClick() }}
          disabled={action.disabled}
          className={`p-1.5 rounded transition-colors ${
            action.disabled
              ? 'opacity-30'
              : action.isActive
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
