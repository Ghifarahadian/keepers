"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { Element } from "@/types/editor"
import { DeleteButton } from "./delete-button"
import { useRef, useCallback } from "react"

interface PhotoElementProps {
  element: Element
}

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'right' | 'bottom' | 'left'

export function PhotoElement({ element }: PhotoElementProps) {
  const { state, selectElement, deleteElementFromCanvas, updateElementLocal, updateElementPosition } = useEditor()
  const isSelected = state.selectedElementId === element.id
  const isDragging = useRef(false)
  const isResizing = useRef<ResizeHandle | null>(null)
  const dragStart = useRef({ x: 0, y: 0 })
  const elementStart = useRef({
    x: element.position_x,
    y: element.position_y,
    width: element.width,
    height: element.height
  })
  const lastPosition = useRef({ x: element.position_x, y: element.position_y, width: element.width, height: element.height })

  // Find the photo in uploadedPhotos to get the fresh signed URL
  const photo = state.uploadedPhotos.find(p => p.path === element.photo_storage_path)
  const photoUrl = photo?.url || element.photo_url || ""

  // Debug logging
  console.log('[PhotoElement] element.photo_storage_path:', element.photo_storage_path)
  console.log('[PhotoElement] element.photo_url:', element.photo_url)
  console.log('[PhotoElement] found photo:', photo)
  console.log('[PhotoElement] using photoUrl:', photoUrl)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Delete this photo?")) {
      await deleteElementFromCanvas(element.id)
    }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Get the canvas element to calculate relative positions
    const canvas = (e.target as HTMLElement).closest('[data-canvas]') as HTMLElement
    if (!canvas) return

    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    elementStart.current = {
      x: element.position_x,
      y: element.position_y,
      width: element.width,
      height: element.height
    }

    selectElement(element.id)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return

      const canvasRect = canvas.getBoundingClientRect()

      // Calculate delta in pixels
      const deltaX = moveEvent.clientX - dragStart.current.x
      const deltaY = moveEvent.clientY - dragStart.current.y

      // Convert to percentage of canvas
      const deltaXPercent = (deltaX / canvasRect.width) * 100
      const deltaYPercent = (deltaY / canvasRect.height) * 100

      // Calculate new position
      let newX = elementStart.current.x + deltaXPercent
      let newY = elementStart.current.y + deltaYPercent

      // Clamp to canvas bounds (0-100%, accounting for element size)
      newX = Math.max(0, Math.min(100 - element.width, newX))
      newY = Math.max(0, Math.min(100 - element.height, newY))

      // Update position locally only (no server call)
      lastPosition.current = { ...lastPosition.current, x: newX, y: newY }
      updateElementLocal(element.id, {
        position_x: newX,
        position_y: newY,
      })
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      // Save final position to server
      updateElementPosition(element.id, {
        position_x: lastPosition.current.x,
        position_y: lastPosition.current.y,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [element.id, element.position_x, element.position_y, element.width, element.height, selectElement, updateElementLocal, updateElementPosition])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation()
    e.preventDefault()

    const canvas = (e.target as HTMLElement).closest('[data-canvas]') as HTMLElement
    if (!canvas) return

    isResizing.current = handle
    dragStart.current = { x: e.clientX, y: e.clientY }
    elementStart.current = {
      x: element.position_x,
      y: element.position_y,
      width: element.width,
      height: element.height
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return

      const canvasRect = canvas.getBoundingClientRect()

      // Calculate delta in percentage
      const deltaX = ((moveEvent.clientX - dragStart.current.x) / canvasRect.width) * 100
      const deltaY = ((moveEvent.clientY - dragStart.current.y) / canvasRect.height) * 100

      let newX = elementStart.current.x
      let newY = elementStart.current.y
      let newWidth = elementStart.current.width
      let newHeight = elementStart.current.height

      const minSize = 5 // Minimum 5% size

      switch (isResizing.current) {
        case 'top-left':
          newX = elementStart.current.x + deltaX
          newY = elementStart.current.y + deltaY
          newWidth = elementStart.current.width - deltaX
          newHeight = elementStart.current.height - deltaY
          break
        case 'top-right':
          newY = elementStart.current.y + deltaY
          newWidth = elementStart.current.width + deltaX
          newHeight = elementStart.current.height - deltaY
          break
        case 'bottom-left':
          newX = elementStart.current.x + deltaX
          newWidth = elementStart.current.width - deltaX
          newHeight = elementStart.current.height + deltaY
          break
        case 'bottom-right':
          newWidth = elementStart.current.width + deltaX
          newHeight = elementStart.current.height + deltaY
          break
        case 'top':
          newY = elementStart.current.y + deltaY
          newHeight = elementStart.current.height - deltaY
          break
        case 'right':
          newWidth = elementStart.current.width + deltaX
          break
        case 'bottom':
          newHeight = elementStart.current.height + deltaY
          break
        case 'left':
          newX = elementStart.current.x + deltaX
          newWidth = elementStart.current.width - deltaX
          break
      }

      // Enforce minimum size and clamp to canvas bounds
      if (newWidth < minSize) {
        if (isResizing.current === 'top-left' || isResizing.current === 'bottom-left' || isResizing.current === 'left') {
          newX = elementStart.current.x + elementStart.current.width - minSize
        }
        newWidth = minSize
      }
      if (newHeight < minSize) {
        if (isResizing.current === 'top-left' || isResizing.current === 'top-right' || isResizing.current === 'top') {
          newY = elementStart.current.y + elementStart.current.height - minSize
        }
        newHeight = minSize
      }

      // Clamp position
      newX = Math.max(0, Math.min(100 - newWidth, newX))
      newY = Math.max(0, Math.min(100 - newHeight, newY))

      // Clamp size
      newWidth = Math.min(100 - newX, newWidth)
      newHeight = Math.min(100 - newY, newHeight)

      // Update locally only (no server call)
      lastPosition.current = { x: newX, y: newY, width: newWidth, height: newHeight }
      updateElementLocal(element.id, {
        position_x: newX,
        position_y: newY,
        width: newWidth,
        height: newHeight,
      })
    }

    const handleMouseUp = () => {
      isResizing.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      // Save final position/size to server
      updateElementPosition(element.id, {
        position_x: lastPosition.current.x,
        position_y: lastPosition.current.y,
        width: lastPosition.current.width,
        height: lastPosition.current.height,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [element.id, element.position_x, element.position_y, element.width, element.height, updateElementLocal, updateElementPosition])

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation()
        selectElement(element.id)
      }}
      className={`absolute cursor-move group ${isSelected ? "z-20" : "z-10"}`}
      style={{
        left: `${element.position_x}%`,
        top: `${element.position_y}%`,
        width: `${element.width}%`,
        height: `${element.height}%`,
        transform: `rotate(${element.rotation}deg)`,
      }}
    >
      {/* Photo */}
      <img
        src={photoUrl}
        alt="Photo"
        className="w-full h-full object-cover rounded"
        style={{
          outline: isSelected ? '4px solid var(--color-accent)' : '1px solid var(--color-border)'
        }}
        draggable={false}
        onError={(e) => {
          console.error('[PhotoElement] Failed to load image:', photoUrl)
        }}
        onLoad={() => {
          console.log('[PhotoElement] Successfully loaded image:', element.photo_storage_path)
        }}
      />

      {/* Delete Button (show on hover or when selected) */}
      <DeleteButton
        onClick={handleDelete}
        className={`absolute top-1 right-1 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      {/* Resize Handles (only show when selected) */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
            className="absolute -top-1 -left-1 w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full cursor-nwse-resize"
            style={{ borderColor: 'var(--color-white)' }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
            className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full cursor-nesw-resize"
            style={{ borderColor: 'var(--color-white)' }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full cursor-nesw-resize"
            style={{ borderColor: 'var(--color-white)' }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full cursor-nwse-resize"
            style={{ borderColor: 'var(--color-white)' }}
          />

          {/* Edge handles (middle of each edge) */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full cursor-ns-resize"
            style={{ borderColor: 'var(--color-white)' }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
            className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full cursor-ew-resize"
            style={{ borderColor: 'var(--color-white)' }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full cursor-ns-resize"
            style={{ borderColor: 'var(--color-white)' }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
            className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 bg-[var(--color-accent)] border-2 rounded-full cursor-ew-resize"
            style={{ borderColor: 'var(--color-white)' }}
          />
        </>
      )}
    </div>
  )
}
