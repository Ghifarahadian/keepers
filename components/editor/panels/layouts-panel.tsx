"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { LAYOUTS } from "@/types/editor"
import { updatePage } from "@/lib/editor-actions"
import { Check } from "lucide-react"

export function LayoutsPanel() {
  const { state, dispatch } = useEditor()

  const currentPage = state.pages.find((p) => p.id === state.currentPageId)
  const currentLayoutId = currentPage?.layout_id || "blank"

  const handleLayoutChange = async (layoutId: string) => {
    if (!currentPage) return

    try {
      await updatePage(currentPage.id, { layout_id: layoutId })
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
          <strong>Tip:</strong> Choose a layout, then drag photos from the Photos panel to fill the zones.
        </p>
      </div>
    </div>
  )
}
