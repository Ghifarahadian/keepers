"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { LAYOUTS } from "@/types/editor"
import { updatePage, createElement, deleteElement } from "@/lib/editor-actions"
import { Check } from "lucide-react"

export function LayoutsPanel() {
  const { state, dispatch, addElementToCanvas } = useEditor()

  const currentPage = state.pages.find((p) => p.id === state.currentPageId)
  const currentLayoutId = currentPage?.layout_id || "blank"

  const handleLayoutChange = async (layoutId: string) => {
    if (!currentPage) return

    try {
      // Get the layout template
      const layout = LAYOUTS.find(l => l.id === layoutId)
      if (!layout) return

      // Update the page's layout_id
      await updatePage(currentPage.id, { layout_id: layoutId })

      // Delete all existing elements on this page
      const existingElements = state.elements[currentPage.id] || []
      for (const element of existingElements) {
        await deleteElement(element.id)
        dispatch({ type: "DELETE_ELEMENT", payload: { elementId: element.id } })
      }

      // Create PictureContainers based on layout zones
      for (let i = 0; i < layout.zones.length; i++) {
        const zone = layout.zones[i]
        await addElementToCanvas(currentPage.id, {
          type: "photo",
          page_id: currentPage.id,
          position_x: zone.position_x,
          position_y: zone.position_y,
          width: zone.width,
          height: zone.height,
          rotation: 0,
          z_index: i,
        })
      }

      // Update layout in state
      dispatch({
        type: "UPDATE_PAGE_LAYOUT",
        payload: { pageId: currentPage.id, layoutId },
      })
    } catch (error) {
      console.error("Failed to update layout:", error)
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>Page Layouts</h3>

      <div className="space-y-3">
        {LAYOUTS.map((layout) => {
          const isActive = currentLayoutId === layout.id

          return (
            <button
              key={layout.id}
              onClick={() => handleLayoutChange(layout.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all`}
              style={{
                borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: isActive ? 'var(--color-white)' : 'transparent'
              }}
            >
              <div className="flex items-start gap-3">
                {/* Layout Preview */}
                <div className="flex-shrink-0 w-16 h-20 border rounded relative overflow-hidden" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-border)' }}>
                  {layout.zones.map((zone, index) => (
                    <div
                      key={index}
                      className={`absolute ${
                        isActive ? "opacity-30" : ""
                      }`}
                      style={{
                        left: `${zone.position_x}%`,
                        top: `${zone.position_y}%`,
                        width: `${zone.width}%`,
                        height: `${zone.height}%`,
                        backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-secondary)'
                      }}
                    />
                  ))}
                </div>

                {/* Layout Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>{layout.name}</h4>
                    {isActive && (
                      <Check className="w-4 h-4 text-[var(--color-accent)]" />
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
                    {layout.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 p-3 border rounded-lg" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-accent)' }}>
        <p className="text-xs" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
          <strong>Tip:</strong> Choose a layout to create picture containers, then drag photos to fill them.
        </p>
      </div>
    </div>
  )
}
