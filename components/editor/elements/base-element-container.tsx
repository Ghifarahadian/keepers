"use client"

import type { Element } from "@/types/editor"
import { useEditor } from "@/lib/contexts/editor-context"
import { useRef, useCallback } from "react"
import { PhotoToolbar, type ToolbarAction } from "../ui/photo-toolbar"

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'right' | 'bottom' | 'left'

const RESIZE_HANDLES: ResizeHandle[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'right', 'bottom', 'left']

const HANDLE_POSITION_CLASSES: Record<ResizeHandle, string> = {
  'top-left': '-top-1 -left-1 cursor-nwse-resize',
  'top-right': '-top-1 -right-1 cursor-nesw-resize',
  'bottom-left': '-bottom-1 -left-1 cursor-nesw-resize',
  'bottom-right': '-bottom-1 -right-1 cursor-nwse-resize',
  'top': '-top-1 left-1/2 -translate-x-1/2 cursor-ns-resize',
  'right': 'top-1/2 -right-1 -translate-y-1/2 cursor-ew-resize',
  'bottom': '-bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize',
  'left': 'top-1/2 -left-1 -translate-y-1/2 cursor-ew-resize',
}

export interface BaseElementContainerProps {
  element: Element
  children: React.ReactNode
  toolbarActions: ToolbarAction[]
  borderColor: string
  backgroundColor: string
  /** Whether to show toolbar and resize handles */
  showControls?: boolean
  /** Called to check if dragging should be disabled (e.g., while editing text) */
  isDragDisabled?: () => boolean
  onDoubleClick?: (e: React.MouseEvent) => void
  /** Inner container className (for padding, etc.) */
  innerClassName?: string
  /** External ref callback (e.g., for droppable) */
  externalRef?: (node: HTMLDivElement | null) => void
  /** Custom toolbar to render (positioned outside overflow container) */
  renderToolbar?: React.ReactNode
}

export function BaseElementContainer({
  element,
  children,
  toolbarActions,
  borderColor,
  backgroundColor,
  showControls = true,
  isDragDisabled,
  onDoubleClick,
  innerClassName = "absolute inset-0 overflow-hidden",
  externalRef,
  renderToolbar,
}: BaseElementContainerProps) {
  const { state, selectElement, updateElementPosition, setDraggingZone } = useEditor()

  const containerRef = useRef<HTMLDivElement>(null)
  const isSelected = state.selectedElementId === element.id

    // Refs for drag/resize state
    const isDragging = useRef(false)
    const isResizing = useRef<ResizeHandle | null>(null)
    const dragStart = useRef({ x: 0, y: 0 })
    const startPosition = useRef({ x: 0, y: 0, width: 0, height: 0 })
    const currentPosition = useRef({ x: 0, y: 0, width: 0, height: 0 })

    const handleClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation()
      selectElement(element.id)
    }, [element.id, selectElement])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      if (isDragDisabled?.()) return
      if (!containerRef.current) return

      e.stopPropagation()
      e.preventDefault()

      const canvas = (e.target as HTMLElement).closest('[data-canvas]') as HTMLElement
      if (!canvas) return

      isDragging.current = true
      setDraggingZone(true)
      dragStart.current = { x: e.clientX, y: e.clientY }
      startPosition.current = {
        x: element.position_x,
        y: element.position_y,
        width: element.width,
        height: element.height
      }
      currentPosition.current = { ...startPosition.current }

      selectElement(element.id)

      // Disable CSS transitions during drag for smooth movement
      containerRef.current.style.transition = 'none'

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return

        const canvasRect = canvas.getBoundingClientRect()
        const deltaX = ((moveEvent.clientX - dragStart.current.x) / canvasRect.width) * 100
        const deltaY = ((moveEvent.clientY - dragStart.current.y) / canvasRect.height) * 100

        const newX = Math.max(0, Math.min(100 - element.width, startPosition.current.x + deltaX))
        const newY = Math.max(0, Math.min(100 - element.height, startPosition.current.y + deltaY))

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

        // Commit final position to state (triggers one React render)
        updateElementPosition(element.id, {
          position_x: currentPosition.current.x,
          position_y: currentPosition.current.y,
        })
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }, [element, isDragDisabled, selectElement, updateElementPosition, setDraggingZone])

    const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
      if (!containerRef.current) return

      e.stopPropagation()
      e.preventDefault()

      const canvas = (e.target as HTMLElement).closest('[data-canvas]') as HTMLElement
      if (!canvas) return

      isResizing.current = handle
      setDraggingZone(true)
      dragStart.current = { x: e.clientX, y: e.clientY }
      startPosition.current = {
        x: element.position_x,
        y: element.position_y,
        width: element.width,
        height: element.height
      }
      currentPosition.current = { ...startPosition.current }

      // Disable CSS transitions during resize
      containerRef.current.style.transition = 'none'

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizing.current || !containerRef.current) return

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
        containerRef.current.style.left = `${x}%`
        containerRef.current.style.top = `${y}%`
        containerRef.current.style.width = `${width}%`
        containerRef.current.style.height = `${height}%`
      }

      const handleMouseUp = () => {
        isResizing.current = null
        setDraggingZone(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)

        // Re-enable transitions
        if (containerRef.current) {
          containerRef.current.style.transition = ''
        }

        // Commit final position to state (triggers one React render)
        updateElementPosition(element.id, {
          position_x: currentPosition.current.x,
          position_y: currentPosition.current.y,
          width: currentPosition.current.width,
          height: currentPosition.current.height,
        })
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }, [element, updateElementPosition, setDraggingZone])

    // Combine internal and external refs
    const setRef = useCallback((node: HTMLDivElement | null) => {
      containerRef.current = node
      externalRef?.(node)
    }, [externalRef])

    return (
      <div
        ref={setRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        className={`absolute border-2 border-dashed cursor-move group ${isSelected ? 'z-20' : 'z-10'}`}
        style={{
          left: `${element.position_x}%`,
          top: `${element.position_y}%`,
          width: `${element.width}%`,
          height: `${element.height}%`,
          borderColor,
          backgroundColor
        }}
      >
        {/* Mini toolbar */}
        {isSelected && showControls && toolbarActions.length > 0 && (
          <PhotoToolbar actions={toolbarActions} />
        )}

        {/* Custom toolbar (e.g., text properties) */}
        {renderToolbar}

        {/* Resize handles */}
        {isSelected && showControls && (
          <>
            {RESIZE_HANDLES.map(handle => (
              <div
                key={handle}
                onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                className={`absolute w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full z-30 ${HANDLE_POSITION_CLASSES[handle]}`}
                style={{ borderColor: 'var(--color-white)' }}
              />
            ))}
          </>
        )}

        {/* Inner container */}
        <div className={innerClassName}>
          {children}
        </div>
      </div>
    )
  }
