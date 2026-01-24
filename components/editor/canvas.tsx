"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { ZoneContainer } from "./elements/zone-container"
import { useDroppable } from "@dnd-kit/core"

export function EditorCanvas() {
  const { state, selectElement } = useEditor()
  const { setNodeRef } = useDroppable({ id: "canvas" })

  const currentPage = state.pages.find((p) => p.id === state.currentPageId)
  const currentElements = state.elements[state.currentPageId] || []
  const zones = state.zones[state.currentPageId] || []
  const isBlankLayout = currentPage?.layout_id === 'blank'

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
        <p style={{ color: 'var(--color-primary-text)', fontFamily: 'var(--font-serif)' }}>No page selected</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
      <div
        ref={setNodeRef}
        data-canvas
        onClick={() => selectElement(null)}
        className="relative shadow-2xl"
        style={{
          aspectRatio: "8.5 / 11",
          width: "min(600px, 90%)",
          maxHeight: "90vh",
          minHeight: "400px",
          backgroundColor: 'var(--color-white)'
        }}
      >
        {zones.map((zone) => (
          <ZoneContainer
            key={zone.id}
            zone={zone}
            elements={currentElements}
            isBlankLayout={isBlankLayout && zone.zone_index === 0}
          />
        ))}

        {currentElements.length === 0 && zones.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="text-center">
              <p className="text-lg font-medium" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
                Drag photos here
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
                Drop into the layout zones
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
