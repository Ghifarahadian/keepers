"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { PhotoElement } from "./photo-element"
import { useDroppable } from "@dnd-kit/core"

export function EditorCanvas() {
  const { state, selectElement } = useEditor()
  const { setNodeRef } = useDroppable({ id: "canvas" })

  const currentPage = state.pages.find((p) => p.id === state.currentPageId)
  const currentElements = state.elements[state.currentPageId] || []

  // Debug logging
  console.log('[EditorCanvas] currentPageId:', state.currentPageId)
  console.log('[EditorCanvas] currentElements:', currentElements)
  console.log('[EditorCanvas] state.elements:', state.elements)

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
        <p style={{ color: 'var(--color-primary-text)', fontFamily: 'var(--font-serif)' }}>No page selected</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
      {/* Canvas Container */}
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
        {/* Drop Zone Hint (only show when no elements) */}
        {currentElements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-lg font-medium" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>Drag photos here</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>Upload photos from the toolbar →</p>
            </div>
          </div>
        )}

        {/* Photo Elements */}
        {currentElements.map((element) => (
          <PhotoElement key={element.id} element={element} />
        ))}

        {/* Grid Overlay (optional) */}
        <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-10 transition-opacity">
          <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        </div>
      </div>
    </div>
  )
}
