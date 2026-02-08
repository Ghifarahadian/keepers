"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { ZoneContainer } from "./elements/zone-container"
import { useDroppable } from "@dnd-kit/core"
import type { Page } from "@/types/editor"

// Individual page component within the spread
function SpreadPage({ page, side }: { page: Page | null; side: 'left' | 'right' }) {
  const { state, selectElement, selectZone, setActivePageSide } = useEditor()
  const { setNodeRef } = useDroppable({
    id: page ? `canvas-${side}` : `canvas-${side}-empty`,
    data: { pageId: page?.id, side }
  })

  const zones = page ? (state.zones[page.id] || []) : []
  const elements = page ? (state.elements[page.id] || []) : []
  const isActive = state.activePageSide === side

  const handleClick = () => {
    selectElement(null)
    selectZone(null)
    setActivePageSide(side)
  }

  return (
    <div
      ref={setNodeRef}
      data-canvas
      data-page-id={page?.id}
      data-side={side}
      onClick={handleClick}
      className="relative flex-1"
      style={{
        aspectRatio: "8.5 / 11",
        backgroundColor: 'var(--color-white)',
        outline: isActive ? '2px solid var(--color-accent)' : 'none',
        outlineOffset: '-2px',
      }}
    >
      {page ? (
        // Render zones (which contain elements)
        zones.map((zone) => {
          // Find elements that belong to this zone
          const zoneElements = elements.filter(el => el.zone_index === zone.zone_index)
          return (
            <ZoneContainer
              key={zone.id}
              zone={zone}
              pageId={page.id}
              elements={zoneElements}
            />
          )
        })
      ) : (
        // Empty page placeholder
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

  // Check if there are any pages at all
  if (!leftPage && !rightPage) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
        <p style={{ color: 'var(--color-primary-text)', fontFamily: 'var(--font-serif)' }}>No pages in this project</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
      {/* Spread container - two pages side by side */}
      <div
        className="flex shadow-2xl"
        style={{
          width: "min(1000px, 95%)",
          maxHeight: "85vh",
        }}
      >
        {/* Left page (back cover on spread 0) */}
        <SpreadPage page={leftPage} side="left" />

        {/* Binding gutter */}
        <div
          className="w-1 flex-shrink-0"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        {/* Right page (front cover on spread 0) */}
        <SpreadPage page={rightPage} side="right" />
      </div>
    </div>
  )
}
