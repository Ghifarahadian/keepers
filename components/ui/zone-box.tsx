"use client"

import { useCallback } from "react"
import { useDroppable } from "@dnd-kit/core"
import { Image, Type } from "lucide-react"
import { useZoneInteraction } from "@/lib/hooks/use-zone-interaction"
import type { PageZone, Element } from "@/types/editor"

type ZoneType = "photo" | "text"

interface BaseZone {
  id?: string
  position_x: number
  position_y: number
  width: number
  height: number
  zone_type: ZoneType
  zone_index?: number
}

interface ZoneBoxProps {
  zone: BaseZone | PageZone
  mode: "admin" | "editor"
  isSelected: boolean
  canvasRef: React.RefObject<HTMLDivElement | null>
  onUpdate: (updates: Partial<BaseZone>) => void
  onSelect: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
  // Admin mode props
  index?: number
  // Editor mode props
  pageId?: string
  elements?: Element[]
}

export function ZoneBox({
  zone,
  mode,
  isSelected,
  canvasRef,
  onUpdate,
  onSelect,
  onDragStart,
  onDragEnd,
  index,
  pageId,
  elements = [],
}: ZoneBoxProps) {
  const isAdmin = mode === "admin"
  const isEmpty = elements.length === 0
  const isPhoto = zone.zone_type === "photo"

  // Setup droppable for editor mode
  const { setNodeRef } = useDroppable({
    id: zone.id ? `zone-${zone.id}` : `zone-temp`,
    data: { type: "zone", zone, pageId },
    disabled: isAdmin,
  })

  // Interaction logic (drag, resize)
  const { handleResizeStart, handleDragStart: handleDrag, elementRef } = useZoneInteraction({
    zone,
    canvasRef,
    onUpdate,
    onDragStart: () => {
      onDragStart?.()
      onSelect()
    },
    onDragEnd,
    canDrag: isAdmin || isEmpty || isSelected,
    canResize: isSelected,
  })

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect()
    },
    [onSelect]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only allow dragging if empty or selected
      if (!isEmpty && !isSelected) return
      handleDrag(e)
    },
    [isEmpty, isSelected, handleDrag]
  )

  // Unified styling based on zone type (same for both admin and editor)
  const bgColor = isPhoto
    ? isSelected
      ? "rgba(212, 120, 108, 0.3)"
      : "rgba(212, 120, 108, 0.15)"
    : isSelected
    ? "rgba(47, 111, 115, 0.3)"
    : "rgba(47, 111, 115, 0.15)"

  const borderColor = isPhoto ? "var(--color-accent)" : "#2F6F73"
  const borderStyle = "solid"

  // Round positions to 1 decimal to match admin editor precision
  const roundedX = Math.round(zone.position_x * 10) / 10
  const roundedY = Math.round(zone.position_y * 10) / 10
  const roundedWidth = Math.round(zone.width * 10) / 10
  const roundedHeight = Math.round(zone.height * 10) / 10

  return (
    <div
      ref={(node) => {
        elementRef.current = node
        if (!isAdmin) setNodeRef(node)
      }}
      data-zone-id={zone.id}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className={`absolute ${isSelected ? "ring-2 ring-offset-1" : ""}`}
      style={{
        left: `${roundedX}%`,
        top: `${roundedY}%`,
        width: `${roundedWidth}%`,
        height: `${roundedHeight}%`,
        border: `2px ${borderStyle} ${borderColor}`,
        backgroundColor: bgColor,
        cursor: isEmpty || isSelected ? "move" : "default",
        overflow: "hidden",
        pointerEvents: "auto",
        boxSizing: "border-box", // ← Include border in width/height
        // @ts-expect-error - Tailwind CSS variable for ring color
        "--tw-ring-color": borderColor,
      }}
    >
      {/* Zone type icon and index (show in admin, or in editor when empty) */}
      {(isAdmin || isEmpty) && (
        <span
          className="absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
          style={{
            backgroundColor: borderColor,
            color: "var(--color-white)",
          }}
        >
          {isPhoto ? <Image className="w-3 h-3" /> : <Type className="w-3 h-3" />}
          {isAdmin && typeof index === "number" ? index + 1 : (zone.zone_index ?? 0) + 1}
        </span>
      )}

      {/* Resize handles */}
      {isSelected && (
        <>
          {/* East handle */}
          <div
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded cursor-ew-resize z-10"
            style={{ backgroundColor: borderColor }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleResizeStart("e")
            }}
          />

          {/* South handle */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded cursor-ns-resize z-10"
            style={{ backgroundColor: borderColor }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleResizeStart("s")
            }}
          />

          {/* South-East corner handle */}
          <div
            className="absolute -right-1 -bottom-1 w-3 h-3 rounded cursor-nwse-resize z-10"
            style={{ backgroundColor: borderColor }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleResizeStart("se")
            }}
          />

          {/* West handle */}
          <div
            className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded cursor-ew-resize z-10"
            style={{ backgroundColor: borderColor }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleResizeStart("w")
            }}
          />

          {/* North handle */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded cursor-ns-resize z-10"
            style={{ backgroundColor: borderColor }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleResizeStart("n")
            }}
          />

          {/* North-West corner handle */}
          <div
            className="absolute -left-1 -top-1 w-3 h-3 rounded cursor-nwse-resize z-10"
            style={{ backgroundColor: borderColor }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleResizeStart("nw")
            }}
          />

          {/* North-East corner handle */}
          <div
            className="absolute -right-1 -top-1 w-3 h-3 rounded cursor-nesw-resize z-10"
            style={{ backgroundColor: borderColor }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleResizeStart("ne")
            }}
          />

          {/* South-West corner handle */}
          <div
            className="absolute -left-1 -bottom-1 w-3 h-3 rounded cursor-nesw-resize z-10"
            style={{ backgroundColor: borderColor }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleResizeStart("sw")
            }}
          />
        </>
      )}

      {/* Editor mode: Render element content inline */}
      {!isAdmin &&
        elements.map((element) => {
          if (element.type === "photo" && element.photo_url) {
            return (
              <img
                key={element.id}
                src={element.photo_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )
          }
          if (element.type === "text") {
            return (
              <div
                key={element.id}
                className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden pointer-events-none"
                style={{
                  fontFamily: element.font_family || undefined,
                  fontSize: element.font_size ? `${element.font_size}px` : undefined,
                  color: element.font_color || "inherit",
                  fontWeight: element.font_weight || undefined,
                  fontStyle: element.font_style || undefined,
                  textAlign: element.text_align || undefined,
                  textDecoration: element.text_decoration !== "none" ? element.text_decoration || undefined : undefined,
                }}
              >
                {element.text_content}
              </div>
            )
          }
          return null
        })}
    </div>
  )
}
