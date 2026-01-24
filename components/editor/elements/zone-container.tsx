"use client"

import { useDroppable } from "@dnd-kit/core"
import type { PageZone, Element } from "@/types/editor"
import { PhotoElement } from "./photo-element"
import { useEditor } from "@/lib/contexts/editor-context"
import { DeleteButton } from "../ui/delete-button"
import { useRef, useCallback } from "react"

interface ZoneContainerProps {
  zone: PageZone
  elements: Element[]
  isBlankLayout?: boolean
}

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'right' | 'bottom' | 'left'

export function ZoneContainer({ zone, elements, isBlankLayout = false }: ZoneContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `zone-${zone.page_id}-${zone.zone_index}`,
    data: { type: "zone", zone }
  })

  const { state, selectElement, deleteElementFromCanvas, updateZonePosition, setDraggingZone } = useEditor()

  // Ref for direct DOM manipulation during drag (bypasses React)
  const zoneRef = useRef<HTMLDivElement>(null)

  // Derive values from props
  const zoneElements = elements.filter(el => el.zone_index === zone.zone_index)
  const isOccupied = zoneElements.length > 0
  const isSelected = zoneElements.some(el => el.id === state.selectedElementId)
  const firstElement = zoneElements[0]

  // Refs for drag/resize state
  const isDragging = useRef(false)
  const isResizing = useRef<ResizeHandle | null>(null)
  const dragStart = useRef({ x: 0, y: 0 })
  const startPosition = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const currentPosition = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (firstElement) {
      selectElement(firstElement.id)
    }
  }, [firstElement, selectElement])

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (firstElement && confirm("Delete this photo?")) {
      await deleteElementFromCanvas(firstElement.id)
    }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isOccupied || !zoneRef.current) return

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

    if (firstElement) selectElement(firstElement.id)

    // Disable CSS transitions during drag for smooth movement
    zoneRef.current.style.transition = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !zoneRef.current) return

      const canvasRect = canvas.getBoundingClientRect()
      const deltaX = ((moveEvent.clientX - dragStart.current.x) / canvasRect.width) * 100
      const deltaY = ((moveEvent.clientY - dragStart.current.y) / canvasRect.height) * 100

      const newX = Math.max(0, Math.min(100 - zone.width, startPosition.current.x + deltaX))
      const newY = Math.max(0, Math.min(100 - zone.height, startPosition.current.y + deltaY))

      currentPosition.current = { ...currentPosition.current, x: newX, y: newY }

      // Direct DOM manipulation - no React re-render
      zoneRef.current.style.left = `${newX}%`
      zoneRef.current.style.top = `${newY}%`
    }

    const handleMouseUp = () => {
      isDragging.current = false
      setDraggingZone(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      // Re-enable transitions
      if (zoneRef.current) {
        zoneRef.current.style.transition = ''
      }

      // Commit final position to state (triggers one React render)
      updateZonePosition(zone.id, {
        position_x: currentPosition.current.x,
        position_y: currentPosition.current.y,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [zone, firstElement, selectElement, isOccupied, updateZonePosition, setDraggingZone])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    if (!isOccupied || !zoneRef.current) return

    e.stopPropagation()
    e.preventDefault()

    const canvas = (e.target as HTMLElement).closest('[data-canvas]') as HTMLElement
    if (!canvas) return

    isResizing.current = handle
    setDraggingZone(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    startPosition.current = {
      x: zone.position_x,
      y: zone.position_y,
      width: zone.width,
      height: zone.height
    }
    currentPosition.current = { ...startPosition.current }

    // Disable CSS transitions during resize
    zoneRef.current.style.transition = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current || !zoneRef.current) return

      const canvasRect = canvas.getBoundingClientRect()
      const deltaX = ((moveEvent.clientX - dragStart.current.x) / canvasRect.width) * 100
      const deltaY = ((moveEvent.clientY - dragStart.current.y) / canvasRect.height) * 100

      let { x, y, width, height } = startPosition.current
      const minSize = 10

      // Calculate new dimensions based on handle
      switch (isResizing.current) {
        case 'top-left':
          x += deltaX; y += deltaY; width -= deltaX; height -= deltaY; break
        case 'top-right':
          y += deltaY; width += deltaX; height -= deltaY; break
        case 'bottom-left':
          x += deltaX; width -= deltaX; height += deltaY; break
        case 'bottom-right':
          width += deltaX; height += deltaY; break
        case 'top':
          y += deltaY; height -= deltaY; break
        case 'right':
          width += deltaX; break
        case 'bottom':
          height += deltaY; break
        case 'left':
          x += deltaX; width -= deltaX; break
      }

      // Enforce minimum size
      if (width < minSize) {
        if (['top-left', 'bottom-left', 'left'].includes(isResizing.current)) {
          x = startPosition.current.x + startPosition.current.width - minSize
        }
        width = minSize
      }
      if (height < minSize) {
        if (['top-left', 'top-right', 'top'].includes(isResizing.current)) {
          y = startPosition.current.y + startPosition.current.height - minSize
        }
        height = minSize
      }

      // Clamp to canvas bounds
      x = Math.max(0, Math.min(100 - width, x))
      y = Math.max(0, Math.min(100 - height, y))
      width = Math.min(100 - x, width)
      height = Math.min(100 - y, height)

      currentPosition.current = { x, y, width, height }

      // Direct DOM manipulation - no React re-render
      zoneRef.current.style.left = `${x}%`
      zoneRef.current.style.top = `${y}%`
      zoneRef.current.style.width = `${width}%`
      zoneRef.current.style.height = `${height}%`
    }

    const handleMouseUp = () => {
      isResizing.current = null
      setDraggingZone(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      // Re-enable transitions
      if (zoneRef.current) {
        zoneRef.current.style.transition = ''
      }

      // Commit final position to state (triggers one React render)
      updateZonePosition(zone.id, {
        position_x: currentPosition.current.x,
        position_y: currentPosition.current.y,
        width: currentPosition.current.width,
        height: currentPosition.current.height,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [zone, isOccupied, updateZonePosition, setDraggingZone])

  // Combine refs for droppable and DOM manipulation
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    zoneRef.current = node
    setNodeRef(node)
  }, [setNodeRef])

  const borderColor = isBlankLayout ? 'transparent'
    : isSelected ? 'rgba(212, 120, 108, 1)'
    : isOver ? 'rgba(212, 120, 108, 0.8)'
    : isOccupied ? 'rgba(212, 120, 108, 0.3)'
    : 'rgba(0, 0, 0, 0.15)'

  const bgColor = isBlankLayout ? 'transparent'
    : isOver ? 'rgba(212, 120, 108, 0.1)'
    : isOccupied ? 'transparent'
    : 'rgba(212, 120, 108, 0.05)'

  return (
    <div
      ref={combinedRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`absolute overflow-hidden ${!isBlankLayout ? 'border-2 border-dashed' : ''} ${isOccupied ? 'cursor-move group' : ''} ${isSelected ? 'z-20' : 'z-10'}`}
      style={{
        left: `${zone.position_x}%`,
        top: `${zone.position_y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
        borderColor,
        backgroundColor: bgColor
      }}
    >
      {/* Zone label */}
      {!isBlankLayout && (
        <div
          className="absolute top-1 left-1 text-xs font-medium px-1.5 py-0.5 rounded pointer-events-none z-10"
          style={{
            color: isOccupied ? 'rgba(0, 0, 0, 0.3)' : 'rgba(212, 120, 108, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'var(--font-serif)'
          }}
        >
          {zone.zone_index + 1}
        </div>
      )}

      {/* Delete button */}
      {isOccupied && (
        <DeleteButton
          onClick={handleDelete}
          className={`absolute top-1 right-1 z-30 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        />
      )}

      {/* Resize handles */}
      {isSelected && isOccupied && (
        <>
          {(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'right', 'bottom', 'left'] as const).map(handle => {
            const positionClasses: Record<ResizeHandle, string> = {
              'top-left': '-top-1 -left-1 cursor-nwse-resize',
              'top-right': '-top-1 -right-1 cursor-nesw-resize',
              'bottom-left': '-bottom-1 -left-1 cursor-nesw-resize',
              'bottom-right': '-bottom-1 -right-1 cursor-nwse-resize',
              'top': '-top-1 left-1/2 -translate-x-1/2 cursor-ns-resize',
              'right': 'top-1/2 -right-1 -translate-y-1/2 cursor-ew-resize',
              'bottom': '-bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize',
              'left': 'top-1/2 -left-1 -translate-y-1/2 cursor-ew-resize',
            }
            return (
              <div
                key={handle}
                onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                className={`absolute w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full z-30 ${positionClasses[handle]}`}
                style={{ borderColor: 'var(--color-white)' }}
              />
            )
          })}
        </>
      )}

      {/* Empty zone placeholder */}
      {!isOccupied && !isBlankLayout && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p
            className="text-sm font-medium text-center px-2"
            style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}
          >
            Drag photos here
          </p>
        </div>
      )}

      {/* Photos */}
      {zoneElements.map((element) => (
        <PhotoElement key={element.id} element={element} />
      ))}
    </div>
  )
}
