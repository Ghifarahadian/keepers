"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useDroppable } from "@dnd-kit/core"
import { Image, ImageMinus, Move, Type, Trash2, ZoomIn, ZoomOut } from "lucide-react"
import { useZoneInteraction } from "@/lib/hooks/use-zone-interaction"
import { useElementInteraction } from "@/lib/hooks/use-element-interaction"
import { PhotoToolbar } from "@/components/editor/ui/photo-toolbar"
import { TextToolbar } from "@/components/editor/ui/text-toolbar"
import type { PageZone, Element, UpdateElementInput } from "@/types/editor"

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
  onElementDelete?: (elementId: string) => void
  onElementUpdate?: (elementId: string, updates: UpdateElementInput) => void
  onZoneDelete?: () => void
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
  onElementDelete,
  onElementUpdate,
  onZoneDelete,
}: ZoneBoxProps) {
  const isAdmin = mode === "admin"
  const isEmpty = elements.length === 0
  const isPhoto = zone.zone_type === "photo"
  const [mounted, setMounted] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [isPanMode, setIsPanMode] = useState(false)

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

  // Element interaction (for image panning)
  const photoElement = isPhoto && elements.length > 0 ? elements[0] : null
  const { handleDragStart: handleElementDragStart, elementRef: elementImageRef } = useElementInteraction({
    element: photoElement || { position_x: 0, position_y: 0 } as any,
    zoneRef: elementRef,
    onUpdate: (updates) => {
      if (photoElement && onElementUpdate) {
        onElementUpdate(photoElement.id, updates)
      }
    },
    enabled: isPanMode && !!photoElement,
  })

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate toolbar position when selected, zone moves, or window scrolls
  useEffect(() => {
    if (!isSelected || !elementRef.current) return

    const updatePosition = () => {
      if (!elementRef.current) return
      const rect = elementRef.current.getBoundingClientRect()
      setToolbarPosition({
        top: rect.top - 10, // 10px above the zone
        left: rect.left + rect.width / 2, // Centered horizontally
      })
    }

    updatePosition()

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('mousemove', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('mousemove', updatePosition)
    }
  }, [isSelected, zone.position_x, zone.position_y, zone.width, zone.height])

  // Auto-reset pan mode when zone is deselected
  useEffect(() => {
    if (!isSelected) {
      setIsPanMode(false)
    }
  }, [isSelected])

  // Auto-reset pan mode when photo is removed
  useEffect(() => {
    if (isPanMode && elements.length === 0) {
      setIsPanMode(false)
    }
  }, [isPanMode, elements.length])

  const handleZoomIn = () => {
    if (photoElement && onElementUpdate) {
      onElementUpdate(photoElement.id, { width: Math.min(300, (photoElement.width || 100) + 10) })
    }
  }
  const handleZoomOut = () => {
    if (photoElement && onElementUpdate) {
      onElementUpdate(photoElement.id, { width: Math.max(50, (photoElement.width || 100) - 10) })
    }
  }

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect()
    },
    [onSelect]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't drag zone if in pan mode
      if (isPanMode) return
      // Only allow dragging if empty or selected
      if (!isEmpty && !isSelected) return
      handleDrag(e)
    },
    [isPanMode, isEmpty, isSelected, handleDrag]
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
        cursor: isPanMode ? "default" : (isEmpty || isSelected ? "move" : "default"),
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

      {/* Empty photo zone prompt */}
      {!isAdmin && isEmpty && isPhoto && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p
            className="text-sm"
            style={{
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-serif)',
              opacity: 0.6,
            }}
          >
            drag photo here
          </p>
        </div>
      )}

      {/* Render toolbar via Portal (outside zone DOM hierarchy) */}
      {mounted && !isAdmin && isSelected && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}
        >
          {isPhoto ? (
            <PhotoToolbar
              actions={
                isEmpty
                  ? onZoneDelete
                    ? [
                        {
                          icon: <Trash2 className="w-4 h-4" />,
                          title: "Delete zone",
                          variant: "danger",
                          onClick: (e) => {
                            e.stopPropagation()
                            onZoneDelete()
                          },
                        },
                      ]
                    : []
                  : elements.length > 0 && onElementDelete && onZoneDelete
                  ? [
                      {
                        icon: <Move className="w-4 h-4" />,
                        title: isPanMode ? "Move zone (click to switch)" : "Move photo (click to switch)",
                        variant: "default",
                        onClick: (e) => {
                          e.stopPropagation()
                          setIsPanMode(!isPanMode)
                        },
                        isActive: isPanMode,
                      },
                      {
                        icon: <ZoomIn className="w-4 h-4" />,
                        title: "Zoom in",
                        variant: "default",
                        onClick: (e) => {
                          e.stopPropagation()
                          handleZoomIn()
                        },
                      },
                      {
                        icon: <ZoomOut className="w-4 h-4" />,
                        title: "Zoom out",
                        variant: "default",
                        onClick: (e) => {
                          e.stopPropagation()
                          handleZoomOut()
                        },
                      },
                      {
                        icon: <ImageMinus className="w-4 h-4" />,
                        title: "Remove photo",
                        variant: "default",
                        onClick: (e) => {
                          e.stopPropagation()
                          onElementDelete(elements[0].id)
                        },
                      },
                      {
                        icon: <Trash2 className="w-4 h-4" />,
                        title: "Delete zone",
                        variant: "danger",
                        onClick: (e) => {
                          e.stopPropagation()
                          onZoneDelete()
                        },
                      },
                    ]
                  : []
              }
            />
          ) : (
            <>
              {isEmpty ? (
                <PhotoToolbar
                  actions={[
                    {
                      icon: <Type className="w-4 h-4" />,
                      title: "Add text",
                      variant: "default",
                      onClick: (e) => {
                        e.stopPropagation()
                      },
                    },
                  ]}
                />
              ) : (
                elements.length > 0 &&
                onElementUpdate &&
                onElementDelete && (
                  <TextToolbar
                    element={elements[0]}
                    onUpdate={(updates) => onElementUpdate(elements[0].id, updates)}
                    onDelete={() => onElementDelete(elements[0].id)}
                  />
                )
              )}
            </>
          )}
        </div>,
        document.body
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
                ref={elementImageRef}
                src={element.photo_url}
                alt=""
                className="absolute inset-0 w-full h-full"
                onMouseDown={isPanMode ? handleElementDragStart : undefined}
                style={{
                  objectFit: 'cover',
                  objectPosition: `${element.position_x}% ${element.position_y}%`,
                  transform: `scale(${(element.width || 100) / 100})`,
                  transformOrigin: `${element.position_x}% ${element.position_y}%`,
                  pointerEvents: isPanMode ? 'auto' : 'none',
                  cursor: isPanMode ? 'grab' : 'default',
                }}
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
