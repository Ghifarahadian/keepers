import { useRef, useCallback } from "react"
import type { Element, UpdateElementInput } from "@/types/editor"

interface UseElementInteractionOptions {
  element: Element
  zoneRef: React.RefObject<HTMLDivElement | null>
  onUpdate: (updates: UpdateElementInput) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  enabled: boolean // Only enable when pan mode is ON
}

export function useElementInteraction({
  element,
  zoneRef,
  onUpdate,
  onDragStart,
  onDragEnd,
  enabled
}: UseElementInteractionOptions) {
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const startPosition = useRef({ x: 0, y: 0 })
  const currentPosition = useRef({ x: 0, y: 0 })
  const elementRef = useRef<HTMLImageElement | null>(null)

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!enabled || !elementRef.current || !zoneRef.current) return

    e.stopPropagation()
    e.preventDefault()

    isDragging.current = true
    onDragStart?.()

    dragStart.current = { x: e.clientX, y: e.clientY }
    startPosition.current = {
      x: element.position_x,
      y: element.position_y
    }
    currentPosition.current = { ...startPosition.current }

    // Disable transitions during drag
    elementRef.current.style.transition = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !elementRef.current || !zoneRef.current) return

      const zoneRect = zoneRef.current.getBoundingClientRect()
      // Invert delta: dragging right should show more of the left side (decrease objectPosition)
      const deltaX = ((moveEvent.clientX - dragStart.current.x) / zoneRect.width) * 100
      const deltaY = ((moveEvent.clientY - dragStart.current.y) / zoneRect.height) * 100

      const newX = Math.max(0, Math.min(100, startPosition.current.x - deltaX))
      const newY = Math.max(0, Math.min(100, startPosition.current.y - deltaY))

      currentPosition.current = { x: newX, y: newY }

      // Direct DOM manipulation - update objectPosition
      elementRef.current.style.objectPosition = `${newX}% ${newY}%`
    }

    const handleMouseUp = () => {
      isDragging.current = false
      onDragEnd?.()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      // Re-enable transitions
      if (elementRef.current) {
        elementRef.current.style.transition = ''
      }

      // Commit final position to state
      onUpdate({
        position_x: currentPosition.current.x,
        position_y: currentPosition.current.y
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [element.position_x, element.position_y, enabled, zoneRef, onUpdate, onDragStart, onDragEnd])

  return {
    isDragging: isDragging.current,
    handleDragStart,
    elementRef
  }
}
