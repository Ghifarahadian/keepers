"use client"

import { useRef, useState, useCallback } from "react"
import { useEditor } from "@/lib/contexts/editor-context"
import { ZoneBox } from "@/components/ui/zone-box"
import { useDroppable } from "@dnd-kit/core"
import type { Page } from "@/types/editor"

// Individual page component within the spread
function SpreadPage({ page, side }: { page: Page | null; side: 'left' | 'right' }) {
  const {
    state,
    selectElement,
    selectZone,
    setActivePageSide,
    updateZonePosition,
    setDraggingZone,
    addZoneToPage,
  } = useEditor()

  const canvasRef = useRef<HTMLDivElement>(null)
  const { setNodeRef } = useDroppable({
    id: page ? `canvas-${side}` : `canvas-${side}-empty`,
    data: { pageId: page?.id, side }
  })

  // Draw state (local — only active during a mouse gesture on this page)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null)

  const zones = page ? (state.zones[page.id] || []) : []
  const isActive = state.activePageSide === side
  const drawingType = state.zoneDrawingType

  const getMousePosition = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!drawingType || !page || e.button !== 0) return
    // Only start draw on empty canvas, not on zones
    const target = e.target as HTMLElement
    if (target.closest('[data-zone-id]')) return
    e.stopPropagation()
    setActivePageSide(side)
    setDrawStart(getMousePosition(e))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawStart) return
    setDrawCurrent(getMousePosition(e))
  }

  const handleMouseUp = async (e: React.MouseEvent) => {
    if (!drawStart || !page || !drawingType) {
      setDrawStart(null)
      setDrawCurrent(null)
      return
    }

    const pos = getMousePosition(e)
    const x = Math.min(drawStart.x, pos.x)
    const y = Math.min(drawStart.y, pos.y)
    const width = Math.abs(pos.x - drawStart.x)
    const height = Math.abs(pos.y - drawStart.y)

    if (width >= 3 && height >= 3) {
      await addZoneToPage(page.id, {
        zone_index: zones.length,
        position_x: Math.round(x * 10) / 10,
        position_y: Math.round(y * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10,
        zone_type: drawingType,
      })
    }

    setDrawStart(null)
    setDrawCurrent(null)
  }

  const handleClick = (_e: React.MouseEvent) => {
    // Don't clear selection when finishing a draw
    if (drawStart) return
    selectElement(null)
    selectZone(null)
    setActivePageSide(side)
  }

  // Draw preview dimensions
  const preview = drawStart && drawCurrent ? {
    left: Math.min(drawStart.x, drawCurrent.x),
    top: Math.min(drawStart.y, drawCurrent.y),
    width: Math.abs(drawCurrent.x - drawStart.x),
    height: Math.abs(drawCurrent.y - drawStart.y),
  } : null

  return (
    <div
      ref={(node) => {
        canvasRef.current = node
        setNodeRef(node)
      }}
      data-canvas
      data-page-id={page?.id}
      data-side={side}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative flex-1"
      style={{
        aspectRatio: "8.5 / 11",
        backgroundColor: 'var(--color-white)',
        outline: isActive ? '2px solid var(--color-accent)' : 'none',
        outlineOffset: '-2px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        cursor: drawingType ? 'crosshair' : 'default',
        userSelect: 'none',
      }}
    >
      {page ? (
        <>
          {/* Zones */}
          {zones.map((zone) => {
            const zoneElements = state.elements[zone.id] || []
            return (
              <ZoneBox
                key={zone.id}
                zone={zone}
                mode="editor"
                pageId={page.id}
                elements={zoneElements}
                isSelected={state.selectedZoneId === zone.id}
                canvasRef={canvasRef}
                onUpdate={(updates) => updateZonePosition(zone.id, updates)}
                onSelect={() => selectZone(zone.id)}
                onDragStart={() => setDraggingZone(true)}
                onDragEnd={() => setDraggingZone(false)}
              />
            )
          })}

          {/* Draw preview */}
          {preview && drawingType && (
            <div
              className="absolute border-2 border-dashed pointer-events-none"
              style={{
                left: `${preview.left}%`,
                top: `${preview.top}%`,
                width: `${preview.width}%`,
                height: `${preview.height}%`,
                borderColor: drawingType === "photo" ? "var(--color-accent)" : "#2F6F73",
                backgroundColor: drawingType === "photo" ? "rgba(212, 120, 108, 0.1)" : "rgba(47, 111, 115, 0.1)",
              }}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
            No page
          </p>
        </div>
      )}
    </div>
  )
}

export function EditorCanvas() {
  const { getCurrentSpreadPages } = useEditor()
  const [leftPage, rightPage] = getCurrentSpreadPages()

  if (!leftPage && !rightPage) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
        <p style={{ color: 'var(--color-primary-text)', fontFamily: 'var(--font-serif)' }}>No pages in this project</p>
      </div>
    )
  }

  const isCoverView = !leftPage || !rightPage

  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
      {isCoverView ? (
        <div
          className="flex shadow-2xl"
          style={{ width: "min(500px, 48%)", maxHeight: "85vh" }}
        >
          <SpreadPage
            page={leftPage ?? rightPage}
            side={leftPage ? 'left' : 'right'}
          />
        </div>
      ) : (
        <div
          className="flex shadow-2xl"
          style={{ width: "min(1000px, 95%)", maxHeight: "85vh" }}
        >
          <SpreadPage page={leftPage} side="left" />
          <div className="w-1 flex-shrink-0" style={{ backgroundColor: 'var(--color-border)' }} />
          <SpreadPage page={rightPage} side="right" />
        </div>
      )}
    </div>
  )
}
