"use client"

import { useEffect, useState } from "react"
import { useEditor } from "@/lib/contexts/editor-context"
import type { Layout } from "@/types/editor"
import { deleteElement, createZone, deleteZone } from "@/lib/editor-actions"
import { getLayouts } from "@/lib/layout-actions"
import { Check, Loader2, AlertCircle } from "lucide-react"

export function LayoutsPanel() {
  const { state, dispatch, getActivePage } = useEditor()
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch layouts from database
  useEffect(() => {
    async function fetchLayouts() {
      try {
        const dbLayouts = await getLayouts()
        if (dbLayouts.length > 0) {
          setLayouts(dbLayouts)
          setError(null)
        } else {
          setError("No layouts available. Please contact support.")
        }
      } catch (err) {
        console.error("Failed to fetch layouts from database:", err)
        setError("Failed to load layouts. Please refresh the page.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchLayouts()
  }, [])

  const currentPage = getActivePage()

  // Get current layout by comparing zones (no layout_id anymore)
  const getCurrentLayoutId = (): string => {
    if (!currentPage) return "blank"

    const currentZones = state.zones[currentPage.id] || []
    if (currentZones.length === 0) return "blank"

    // Find matching layout by zone configuration
    for (const layout of layouts) {
      if (layout.zones.length === currentZones.length) {
        // Simple comparison: if zone count matches, consider it the same layout
        // (This is simplified - in production you might want more precise matching)
        return layout.id
      }
    }

    return "custom" // Custom layout if doesn't match any template
  }

  const currentLayoutId = getCurrentLayoutId()

  const handleLayoutChange = async (layoutId: string) => {
    if (!currentPage) return

    try {
      // Get the layout template
      const layout = layouts.find(l => l.id === layoutId)
      if (!layout) return

      // Delete all existing elements on this page
      const existingElements = state.elements[currentPage.id] || []
      for (const element of existingElements) {
        await deleteElement(element.id)
        dispatch({ type: "DELETE_ELEMENT", payload: { pageId: currentPage.id, elementId: element.id } })
      }

      // Delete all existing zones
      const existingZones = state.zones[currentPage.id] || []
      for (const zone of existingZones) {
        await deleteZone(zone.id)
      }

      // Copy zones from layout to page
      const newZones = []
      for (let i = 0; i < layout.zones.length; i++) {
        const layoutZone = layout.zones[i]
        const zone = await createZone({
          page_id: currentPage.id,
          zone_index: i,
          position_x: layoutZone.position_x,
          position_y: layoutZone.position_y,
          width: layoutZone.width,
          height: layoutZone.height,
        })
        newZones.push(zone)
      }

      // Update zones in state
      dispatch({
        type: "SET_ZONES",
        payload: { pageId: currentPage.id, zones: newZones },
      })
    } catch (error) {
      console.error("Failed to update layout:", error)
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>Page Layouts</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-accent)' }} />
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Refresh page
            </button>
          </div>
        </div>
      ) : (
      <div className="space-y-3">
        {layouts.map((layout) => {
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
      )}

      <div className="mt-6 p-3 border rounded-lg" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-accent)' }}>
        <p className="text-xs" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
          <strong>Tip:</strong> Choose a layout to create picture containers, then drag photos to fill them.
        </p>
      </div>
    </div>
  )
}
