"use client"

import React, { memo, useRef, useEffect } from "react"
import { useEditor } from "@/lib/contexts/editor-context"
import { Plus } from "lucide-react"
import { createPage, deletePage } from "@/lib/editor-actions"
import type { Page, Element, PageZone } from "@/types/editor"

interface PageThumbnailProps {
  page: Page
  zones: PageZone[]
  elements: Element[]
  uploadedPhotos: { path: string; url: string }[]
  isDragging: boolean
}

// Mini preview component for page thumbnails - renders zones with elements inside
// Memoized to prevent re-renders during zone dragging
const PageThumbnail = memo(function PageThumbnail({
  page,
  zones,
  elements,
  uploadedPhotos,
}: PageThumbnailProps) {
  const isBlankLayout = page.layout_id === 'blank'

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: 'var(--color-white)' }}>
      {zones.length === 0 && elements.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[8px]" style={{ color: 'var(--color-secondary)' }}>Empty</span>
        </div>
      ) : (
        zones.map((zone) => {
          const zoneElements = elements.filter(el => el.zone_index === zone.zone_index)
          const element = zoneElements[0]

          return (
            <div
              key={zone.id}
              className="absolute overflow-hidden"
              style={{
                left: `${zone.position_x}%`,
                top: `${zone.position_y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
                border: isBlankLayout ? 'none' : '1px dashed rgba(0,0,0,0.1)',
              }}
            >
              {element && element.type === 'photo' && (() => {
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
            </div>
          )
        })
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
    prevProps.page.id === nextProps.page.id &&
    prevProps.page.layout_id === nextProps.page.layout_id &&
    prevProps.zones === nextProps.zones &&
    prevProps.elements === nextProps.elements &&
    prevProps.uploadedPhotos === nextProps.uploadedPhotos
  )
})

export function EditorPagebar() {
  const { state, setCurrentPage, dispatch } = useEditor()

  const handleAddPage = async () => {
    try {
      const newPageNumber = state.pages.length + 1
      const newPage = await createPage({
        project_id: state.project.id,
        page_number: newPageNumber,
        layout_id: "blank",
      })

      dispatch({ type: "ADD_PAGE", payload: newPage })
      setCurrentPage(newPage.id)
    } catch (error) {
      console.error("Failed to add page:", error)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (state.pages.length <= 1) {
      alert("You must have at least one page")
      return
    }

    if (!confirm("Are you sure you want to delete this page?")) {
      return
    }

    try {
      await deletePage(pageId, state.project.id)
      dispatch({ type: "DELETE_PAGE", payload: pageId })
    } catch (error) {
      console.error("Failed to delete page:", error)
    }
  }

  return (
    <aside className="fixed left-0 top-16 bottom-14 w-60 border-r overflow-y-auto" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-border)' }}>
      <div className="p-4 space-y-3">
        {/* Page List */}
        {state.pages.map((page, index) => (
          <div
            key={page.id}
            className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
              state.currentPageId === page.id
                ? "border-[var(--color-accent)] shadow-md"
                : "hover:shadow-sm"
            }`}
            style={{
              backgroundColor: 'var(--color-white)',
              borderColor: state.currentPageId === page.id ? 'var(--color-accent)' : 'var(--color-border)'
            }}
            onClick={() => setCurrentPage(page.id)}
          >
            {/* Page Thumbnail */}
            <div className="aspect-[8.5/11] flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--color-white)' }}>
              {/* Page Preview */}
              <PageThumbnail
                page={page}
                zones={state.zones[page.id] || []}
                elements={state.elements[page.id] || []}
                uploadedPhotos={state.uploadedPhotos}
                isDragging={state.isDraggingZone}
              />

              {/* Delete button (only show if more than 1 page) */}
              {state.pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePage(page.id)
                  }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
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

            {/* Page Number */}
            <div className="p-2 text-center">
              <span className="text-sm font-medium" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>Page {index + 1}</span>
            </div>
          </div>
        ))}

        {/* Add Page Button */}
        <button
          onClick={handleAddPage}
          className="w-full aspect-[8.5/11] rounded-lg border-2 border-dashed hover:border-[var(--color-accent)] transition-all flex flex-col items-center justify-center gap-2 hover:text-[var(--color-accent)]"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-neutral)',
            fontFamily: 'var(--font-serif)'
          }}
        >
          <Plus className="w-8 h-8" />
          <span className="text-sm font-medium">Add Page</span>
        </button>
      </div>
    </aside>
  )
}
