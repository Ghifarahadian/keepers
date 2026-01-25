"use client"

import React, { memo, useMemo } from "react"
import { useEditor } from "@/lib/contexts/editor-context"
import { Plus } from "lucide-react"
import { createPage, deletePage } from "@/lib/editor-actions"
import type { Page, Element } from "@/types/editor"

interface PageThumbnailProps {
  page: Page | null
  elements: Element[]
  uploadedPhotos: { path: string; url: string }[]
  isDragging: boolean
}

// Mini preview component for page thumbnails - renders elements directly
// Memoized to prevent re-renders during element dragging
const PageThumbnail = memo(function PageThumbnail({
  page,
  elements,
  uploadedPhotos,
}: PageThumbnailProps) {
  if (!page) {
    return (
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--color-white)', aspectRatio: '8.5 / 11' }}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[6px]" style={{ color: 'var(--color-secondary)' }}>Empty</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: 'var(--color-white)', aspectRatio: '8.5 / 11' }}>
      {elements.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[6px]" style={{ color: 'var(--color-secondary)' }}>Empty</span>
        </div>
      ) : (
        elements.map((element) => (
          <div
            key={element.id}
            className="absolute overflow-hidden"
            style={{
              left: `${element.position_x}%`,
              top: `${element.position_y}%`,
              width: `${element.width}%`,
              height: `${element.height}%`,
              border: '1px dashed rgba(0,0,0,0.1)',
            }}
          >
            {element.type === 'photo' && (() => {
              const photo = uploadedPhotos.find(p => p.path === element.photo_storage_path)
              const photoUrl = photo?.url || element.photo_url || ""
              if (!photoUrl) return null
              return (
                <img
                  src={photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )
            })()}
            {element.type === 'text' && element.text_content && (() => {
              // Scale font size relative to canvas (thumbnail is ~1/8 of canvas width for spread)
              const baseFontSize = element.font_size || 16
              const scaledFontSize = Math.max(2, baseFontSize * 0.15)
              return (
                <div
                  className="w-full h-full overflow-hidden p-0.5"
                  style={{
                    fontSize: `${scaledFontSize}px`,
                    lineHeight: 1.2,
                    fontFamily: element.font_family || 'var(--font-serif)',
                    fontWeight: element.font_weight || 'normal',
                    fontStyle: element.font_style || 'normal',
                    textDecoration: element.text_decoration || 'none',
                    textAlign: element.text_align || 'left',
                    color: element.font_color || 'var(--color-neutral)',
                  }}
                >
                  <span className="w-full">{element.text_content}</span>
                </div>
              )
            })()}
          </div>
        ))
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Skip re-render if currently dragging
  if (nextProps.isDragging) {
    return true // Props are "equal" - don't re-render
  }
  // Otherwise, do shallow comparison
  return (
    prevProps.page?.id === nextProps.page?.id &&
    prevProps.elements === nextProps.elements &&
    prevProps.uploadedPhotos === nextProps.uploadedPhotos
  )
})

interface Spread {
  index: number
  leftPage: Page | null
  rightPage: Page | null
}

export function EditorPagebar() {
  const { state, setCurrentSpread, dispatch } = useEditor()

  // Calculate spreads from pages
  const spreads = useMemo((): Spread[] => {
    const result: Spread[] = []
    for (let i = 0; i < state.pages.length; i += 2) {
      result.push({
        index: Math.floor(i / 2),
        leftPage: state.pages[i] || null,
        rightPage: state.pages[i + 1] || null,
      })
    }
    // If no pages, show one empty spread
    if (result.length === 0) {
      result.push({ index: 0, leftPage: null, rightPage: null })
    }
    return result
  }, [state.pages])

  // Add pages in pairs
  const handleAddSpread = async () => {
    try {
      const nextPageNumber = state.pages.length + 1

      // Create two pages at once
      const page1 = await createPage({
        project_id: state.project.id,
        page_number: nextPageNumber,
        layout_id: "blank",
      })
      const page2 = await createPage({
        project_id: state.project.id,
        page_number: nextPageNumber + 1,
        layout_id: "blank",
      })

      dispatch({ type: "ADD_PAGE", payload: page1 })
      dispatch({ type: "ADD_PAGE", payload: page2 })

      // Navigate to the new spread
      const newSpreadIndex = Math.floor(state.pages.length / 2)
      setCurrentSpread(newSpreadIndex)
    } catch (error) {
      console.error("Failed to add spread:", error)
    }
  }

  // Delete entire spread (both pages)
  const handleDeleteSpread = async (spread: Spread) => {
    if (spreads.length <= 1) {
      alert("You must have at least one spread")
      return
    }

    if (!confirm("Are you sure you want to delete this spread (both pages)?")) {
      return
    }

    try {
      // Delete both pages in the spread
      if (spread.leftPage) {
        await deletePage(spread.leftPage.id, state.project.id)
        dispatch({ type: "DELETE_PAGE", payload: spread.leftPage.id })
      }
      if (spread.rightPage) {
        await deletePage(spread.rightPage.id, state.project.id)
        dispatch({ type: "DELETE_PAGE", payload: spread.rightPage.id })
      }
    } catch (error) {
      console.error("Failed to delete spread:", error)
    }
  }

  return (
    <aside className="fixed left-0 top-16 bottom-14 w-60 border-r overflow-y-auto" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-border)' }}>
      <div className="p-4 space-y-3">
        {/* Spread List */}
        {spreads.map((spread) => (
          <div
            key={`spread-${spread.index}`}
            className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
              state.currentSpreadIndex === spread.index
                ? "border-[var(--color-accent)] shadow-md"
                : "hover:shadow-sm"
            }`}
            style={{
              backgroundColor: 'var(--color-white)',
              borderColor: state.currentSpreadIndex === spread.index ? 'var(--color-accent)' : 'var(--color-border)'
            }}
            onClick={() => setCurrentSpread(spread.index)}
          >
            {/* Spread Thumbnail - Two pages side by side */}
            <div className="flex gap-0.5 p-1" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
              {/* Left page thumbnail */}
              <PageThumbnail
                page={spread.leftPage}
                elements={spread.leftPage ? (state.elements[spread.leftPage.id] || []) : []}
                uploadedPhotos={state.uploadedPhotos}
                isDragging={state.isDragging}
              />
              {/* Right page thumbnail */}
              <PageThumbnail
                page={spread.rightPage}
                elements={spread.rightPage ? (state.elements[spread.rightPage.id] || []) : []}
                uploadedPhotos={state.uploadedPhotos}
                isDragging={state.isDragging}
              />

              {/* Delete button (only show if more than 1 spread) */}
              {spreads.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSpread(spread)
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    color: 'var(--color-white)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error)'}
                >
                  ×
                </button>
              )}
            </div>

            {/* Spread Label */}
            <div className="p-1.5 text-center">
              <span className="text-xs font-medium" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
                {spread.index === 0 ? 'Covers' : `Pages ${spread.index * 2}-${spread.index * 2 + 1}`}
              </span>
            </div>
          </div>
        ))}

        {/* Add Spread Button */}
        <button
          onClick={handleAddSpread}
          className="w-full rounded-lg border-2 border-dashed hover:border-[var(--color-accent)] transition-all flex flex-col items-center justify-center gap-1 py-4 hover:text-[var(--color-accent)]"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-neutral)',
            fontFamily: 'var(--font-serif)'
          }}
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs font-medium">Add Spread</span>
        </button>
      </div>
    </aside>
  )
}
