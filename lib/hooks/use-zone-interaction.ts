import { useRef, useCallback, useState } from "react"
import { calculateResizedPosition } from "@/lib/utils/zone-resize"

interface ZonePosition {
  position_x: number
  position_y: number
  width: number
  height: number
}

interface UseZoneInteractionOptions {
  zone: ZonePosition
  canvasRef: React.RefObject<HTMLElement | null>
  onUpdate: (updates: Partial<ZonePosition>) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  canDrag?: boolean
  canResize?: boolean
}

export function useZoneInteraction({
  zone,
  canvasRef,
  onUpdate,
  onDragStart,
  onDragEnd,
  canDrag = true,
  canResize = true,
}: UseZoneInteractionOptions) {
  const [resizing, setResizing] = useState<string | null>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const startPosition = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const currentPosition = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const elementRef = useRef<HTMLDivElement | null>(null)

  const getMousePosition = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }, [canvasRef])

  const handleResizeStart = useCallback((direction: string) => {
    if (!canResize || !elementRef.current || !canvasRef.current) return

    setResizing(direction)
    onDragStart?.()

    startPosition.current = {
      x: zone.position_x,
      y: zone.position_y,
      width: zone.width,
      height: zone.height
    }
    currentPosition.current = { ...startPosition.current }

    // Disable CSS transitions during resize
    elementRef.current.style.transition = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!elementRef.current) return

      const mousePos = getMousePosition(moveEvent.clientX, moveEvent.clientY)
      const newPosition = calculateResizedPosition(
        direction,
        mousePos.x,
        mousePos.y,
        startPosition.current
      )

      currentPosition.current = newPosition

      // Direct DOM manipulation - no React re-render
      elementRef.current.style.left = `${newPosition.x}%`
      elementRef.current.style.top = `${newPosition.y}%`
      elementRef.current.style.width = `${newPosition.width}%`
      elementRef.current.style.height = `${newPosition.height}%`
    }

    const handleMouseUp = () => {
      setResizing(null)
      onDragEnd?.()
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      // Re-enable transitions
      if (elementRef.current) {
        elementRef.current.style.transition = ''
      }

      // Commit final position and size to state
      onUpdate({
        position_x: currentPosition.current.x,
        position_y: currentPosition.current.y,
        width: currentPosition.current.width,
        height: currentPosition.current.height,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [zone, canResize, canvasRef, onUpdate, onDragStart, onDragEnd, getMousePosition])

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!canDrag || !elementRef.current || !canvasRef.current) return
    if (resizing) return // Don't drag while resizing

    e.stopPropagation()
    e.preventDefault()

    isDragging.current = true
    onDragStart?.()

    dragStart.current = { x: e.clientX, y: e.clientY }
    startPosition.current = {
      x: zone.position_x,
      y: zone.position_y,
      width: zone.width,
      height: zone.height
    }
    currentPosition.current = { ...startPosition.current }

    // Disable CSS transitions during drag
    elementRef.current.style.transition = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !elementRef.current || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const deltaX = ((moveEvent.clientX - dragStart.current.x) / canvasRect.width) * 100
      const deltaY = ((moveEvent.clientY - dragStart.current.y) / canvasRect.height) * 100

      const newX = Math.max(0, Math.min(100 - zone.width, startPosition.current.x + deltaX))
      const newY = Math.max(0, Math.min(100 - zone.height, startPosition.current.y + deltaY))

      currentPosition.current = { ...currentPosition.current, x: newX, y: newY }

      // Direct DOM manipulation - no React re-render
      elementRef.current.style.left = `${newX}%`
      elementRef.current.style.top = `${newY}%`
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
        position_y: currentPosition.current.y,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [zone, canDrag, canvasRef, onUpdate, onDragStart, onDragEnd, resizing])

  return {
    resizing,
    isDragging: isDragging.current,
    handleResizeStart,
    handleDragStart,
    elementRef,
  }
}
