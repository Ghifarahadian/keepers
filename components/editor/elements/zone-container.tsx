"use client"

import { useDroppable } from "@dnd-kit/core"
import type { PageZone, Element } from "@/types/editor"
import { useEditor } from "@/lib/contexts/editor-context"
import { useRef, useCallback } from "react"
import { PictureContainer } from "./picture-container"
import { TextContainer } from "./text-container"

interface ZoneContainerProps {
  zone: PageZone
  pageId: string
  elements: Element[]
}

export function ZoneContainer({ zone, pageId, elements }: ZoneContainerProps) {
  const { state, selectZone, updateZonePosition, setDraggingZone } = useEditor()
  const containerRef = useRef<HTMLDivElement>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: `zone-${zone.id}`,
    data: { type: "zone", zone, pageId }
  })

  const isSelected = state.selectedZoneId === zone.id
  const isEmpty = elements.length === 0

  // Refs for drag/resize state
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const startPosition = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const currentPosition = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    selectZone(zone.id)
  }, [zone.id, selectZone])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only allow dragging empty zones or when selected
    if (!isEmpty && !isSelected) return
    if (!containerRef.current) return

    e.stopPropagation()
    e.preventDefault()

    const canvas = (e.target as HTMLElement).closest('[data-canvas]') as HTMLElement
    if (!canvas) return

    isDragging.current = true
    setDraggingZone(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    startPosition.current = {
      x: zone.position_x,
      y: zone.position_y,
      width: zone.width,
      height: zone.height
    }
    currentPosition.current = { ...startPosition.current }

    selectZone(zone.id)

    // Disable CSS transitions during drag
    containerRef.current.style.transition = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const canvasRect = canvas.getBoundingClientRect()
      const deltaX = ((moveEvent.clientX - dragStart.current.x) / canvasRect.width) * 100
      const deltaY = ((moveEvent.clientY - dragStart.current.y) / canvasRect.height) * 100

      const newX = Math.max(0, Math.min(100 - zone.width, startPosition.current.x + deltaX))
      const newY = Math.max(0, Math.min(100 - zone.height, startPosition.current.y + deltaY))

      currentPosition.current = { ...currentPosition.current, x: newX, y: newY }

      // Direct DOM manipulation - no React re-render
      containerRef.current.style.left = `${newX}%`
      containerRef.current.style.top = `${newY}%`
    }

    const handleMouseUp = () => {
      isDragging.current = false
      setDraggingZone(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      // Re-enable transitions
      if (containerRef.current) {
        containerRef.current.style.transition = ''
      }

      // Commit final position to state
      updateZonePosition(zone.id, {
        position_x: currentPosition.current.x,
        position_y: currentPosition.current.y,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [zone, isEmpty, isSelected, selectZone, updateZonePosition, setDraggingZone])

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
        containerRef.current = node
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
