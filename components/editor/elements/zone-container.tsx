"use client"

import { useDroppable } from "@dnd-kit/core"
import type { PageZone, Element } from "@/types/editor"
import { useEditor } from "@/lib/contexts/editor-context"
import { useCallback } from "react"
import { PictureContainer } from "./picture-container"
import { TextContainer } from "./text-container"
import { ResizeHandles } from "@/components/ui/resize-handles"
import { useZoneInteraction } from "@/lib/hooks/use-zone-interaction"

interface ZoneContainerProps {
  zone: PageZone
  pageId: string
  elements: Element[]
  canvasRef: React.RefObject<HTMLDivElement | null>
}

export function ZoneContainer({ zone, pageId, elements, canvasRef }: ZoneContainerProps) {
  const { state, selectZone, updateZonePosition, setDraggingZone } = useEditor()

  const { setNodeRef, isOver } = useDroppable({
    id: `zone-${zone.id}`,
    data: { type: "zone", zone, pageId }
  })

  const isSelected = state.selectedZoneId === zone.id
  const isEmpty = elements.length === 0

  const { resizing, handleResizeStart, handleDragStart, elementRef } = useZoneInteraction({
    zone,
    canvasRef,
    onUpdate: (updates) => updateZonePosition(zone.id, updates),
    onDragStart: () => {
      setDraggingZone(true)
      selectZone(zone.id)
    },
    onDragEnd: () => setDraggingZone(false),
    canDrag: isEmpty || isSelected,
    canResize: isSelected,
  })

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    selectZone(zone.id)
  }, [zone.id, selectZone])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only allow dragging empty zones or when selected
    if (!isEmpty && !isSelected) return
    handleDragStart(e)
  }, [isEmpty, isSelected, handleDragStart])

  const borderColor = isSelected
    ? 'rgba(212, 120, 108, 1)'
    : isOver
    ? 'rgba(212, 120, 108, 0.8)'
    : isEmpty
    ? 'rgba(0, 0, 0, 0.2)'
    : 'rgba(0, 0, 0, 0.1)'

  const bgColor = isOver
    ? 'rgba(212, 120, 108, 0.1)'
    : isEmpty
    ? 'rgba(245, 243, 239, 0.5)'
    : 'transparent'

  return (
    <div
      ref={(node) => {
        elementRef.current = node
        setNodeRef(node)
      }}
      data-zone-id={zone.id}
      onClick={handleClick}
      onMouseDown={isEmpty || isSelected ? handleMouseDown : undefined}
      className="absolute"
      style={{
        left: `${zone.position_x}%`,
        top: `${zone.position_y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
        border: `2px ${isEmpty || isSelected ? 'dashed' : 'solid'} ${borderColor}`,
        backgroundColor: bgColor,
        cursor: isEmpty || isSelected ? 'move' : 'default',
        overflow: 'hidden', // Clip element content
        pointerEvents: 'auto',
      }}
    >
      {/* Zone label (only show for empty zones) */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-xs font-medium px-2 py-1 rounded"
            style={{
              color: 'var(--color-secondary)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'var(--font-serif)'
            }}
          >
            Zone {zone.zone_index + 1}
          </span>
        </div>
      )}

      {/* Resize handles (only show for selected zones) */}
      {isSelected && (
        <ResizeHandles
          borderColor="rgba(212, 120, 108, 1)"
          onResizeStart={handleResizeStart}
        />
      )}

      {/* Render elements inside this zone */}
      {elements.map((element) => {
        if (element.type === 'photo') {
          return <PictureContainer key={element.id} element={element} zoneId={zone.id} />
        } else if (element.type === 'text') {
          return <TextContainer key={element.id} element={element} zoneId={zone.id} />
        }
        return null
      })}
    </div>
  )
}
