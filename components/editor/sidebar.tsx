"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { Plus } from "lucide-react"
import { createPage, deletePage } from "@/lib/editor-actions"
import type { Page, Element } from "@/types/editor"

// Mini preview component for page thumbnails
function PageThumbnail({ page, elements, uploadedPhotos }: {
  page: Page
  elements: Element[]
  uploadedPhotos: { path: string; url: string }[]
}) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: 'var(--color-white)' }}>
      {elements.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[8px]" style={{ color: 'var(--color-secondary)' }}>Empty</span>
        </div>
      ) : (
        elements.map((element) => {
          if (element.type !== 'photo') return null

          // Find the photo URL
          const photo = uploadedPhotos.find(p => p.path === element.photo_storage_path)
          const photoUrl = photo?.url || element.photo_url || ""

          if (!photoUrl) return null

          return (
            <div
              key={element.id}
              className="absolute overflow-hidden"
              style={{
                left: `${element.position_x}%`,
                top: `${element.position_y}%`,
                width: `${element.width}%`,
                height: `${element.height}%`,
                transform: `rotate(${element.rotation}deg)`,
              }}
            >
              <img
                src={photoUrl}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          )
        })
      )}
    </div>
  )
}

export function EditorSidebar() {
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
                elements={state.elements[page.id] || []}
                uploadedPhotos={state.uploadedPhotos}
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
