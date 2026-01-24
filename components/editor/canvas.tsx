"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { PictureContainer } from "./elements/picture-container"
import { TextContainer } from "./elements/text-container"
import { useDroppable } from "@dnd-kit/core"

export function EditorCanvas() {
  const { state, selectElement } = useEditor()
  const { setNodeRef } = useDroppable({ id: "canvas" })

  const currentPage = state.pages.find((p) => p.id === state.currentPageId)
  const currentElements = state.elements[state.currentPageId] || []

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
        {/* Render all elements with their respective containers */}
        {currentElements.map((element) => {
          if (element.type === 'photo') {
            return <PictureContainer key={element.id} element={element} />
          } else if (element.type === 'text') {
            return <TextContainer key={element.id} element={element} />
          }
          return null
        })}
      </div>
    </div>
  )
}
