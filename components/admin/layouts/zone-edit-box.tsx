"use client"

import { useCallback } from "react"
import { Image, Type } from "lucide-react"
import { ResizeHandles } from "@/components/ui/resize-handles"
import { useZoneInteraction } from "@/lib/hooks/use-zone-interaction"
import type { Zone, ZoneType } from "./zone-editor"

interface ZoneEditBoxProps {
  zone: Zone
  index: number
  isSelected: boolean
  canvasRef: React.RefObject<HTMLDivElement | null>
  onUpdate: (index: number, updates: Partial<Zone>) => void
  onSelect: (index: number) => void
}

export function ZoneEditBox({
  zone,
  index,
  isSelected,
  canvasRef,
  onUpdate,
  onSelect,
}: ZoneEditBoxProps) {
  const isPhoto = zone.zone_type === "photo"
  const bgColor = isPhoto
    ? isSelected
      ? "rgba(212, 120, 108, 0.3)"
      : "rgba(212, 120, 108, 0.15)"
    : isSelected
    ? "rgba(47, 111, 115, 0.3)"
    : "rgba(47, 111, 115, 0.15)"
  const borderColor = isPhoto ? "var(--color-accent)" : "#2F6F73"

  const { handleResizeStart, handleDragStart, elementRef } = useZoneInteraction({
    zone,
    canvasRef,
    onUpdate: (updates) => onUpdate(index, updates),
    onDragStart: () => onSelect(index),
    canDrag: true,
    canResize: isSelected,
  })

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect(index)
    },
    [index, onSelect]
  )

  return (
    <div
      ref={elementRef}
      className={`absolute border-2 ${isSelected ? "ring-2 ring-offset-1" : ""}`}
      style={{
        left: `${zone.position_x}%`,
        top: `${zone.position_y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
        backgroundColor: bgColor,
        borderColor: borderColor,
        cursor: isSelected ? "move" : "pointer",
        // @ts-expect-error - Tailwind CSS variable for ring color
        "--tw-ring-color": borderColor,
      }}
      onClick={handleClick}
      onMouseDown={handleDragStart}
    >
      {/* Zone index and type icon */}
      <span
        className="absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
        style={{
          backgroundColor: borderColor,
          color: "var(--color-white)",
        }}
      >
        {isPhoto ? <Image className="w-3 h-3" /> : <Type className="w-3 h-3" />}
        {index + 1}
      </span>

      {/* Resize handles */}
      {isSelected && (
        <ResizeHandles borderColor={borderColor} onResizeStart={handleResizeStart} />
      )}
    </div>
  )
}
