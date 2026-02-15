"use client"

import { Trash2, Image, Type, Pencil, PencilOff } from "lucide-react"
import { useEditor } from "@/lib/contexts/editor-context"

export function ZonesPanel() {
  const { state, getActivePage, selectZone, deleteZoneFromPage, setZoneDrawingType } = useEditor()

  const activePage = getActivePage()
  const zones = activePage ? (state.zones[activePage.id] || []) : []
  const drawingType = state.zoneDrawingType

  const handleDeleteSelected = async () => {
    if (!state.selectedZoneId) return
    await deleteZoneFromPage(state.selectedZoneId)
  }

  const toggleDraw = (type: "photo" | "text") => {
    setZoneDrawingType(drawingType === type ? null : type)
  }

  if (!activePage) {
    return (
      <div className="p-4 text-sm text-center" style={{ color: "var(--color-secondary)", fontFamily: "var(--font-serif)" }}>
        Select a page to manage its zones.
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold" style={{ color: "var(--color-neutral)", fontFamily: "var(--font-serif)" }}>
        Zones
      </h3>

      {/* Draw mode toggle */}
      <div className="space-y-2">
        <p className="text-xs" style={{ color: "var(--color-secondary)" }}>Draw on canvas:</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toggleDraw("photo")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-sm"
            style={{
              backgroundColor: drawingType === "photo" ? "var(--color-accent)" : "transparent",
              border: "1px solid var(--color-accent)",
              color: drawingType === "photo" ? "white" : "var(--color-accent)",
            }}
          >
            {drawingType === "photo" ? <PencilOff className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            <Image className="w-3.5 h-3.5" />
            Photo zone
          </button>
          <button
            type="button"
            onClick={() => toggleDraw("text")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-sm"
            style={{
              backgroundColor: drawingType === "text" ? "#2F6F73" : "transparent",
              border: "1px solid #2F6F73",
              color: drawingType === "text" ? "white" : "#2F6F73",
            }}
          >
            {drawingType === "text" ? <PencilOff className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            <Type className="w-3.5 h-3.5" />
            Text zone
          </button>
        </div>
        {drawingType && (
          <p className="text-xs" style={{ color: "var(--color-secondary)", fontFamily: "var(--font-serif)" }}>
            Click and drag on the page to draw a {drawingType} zone.
          </p>
        )}
      </div>

      <div className="h-px" style={{ backgroundColor: "var(--color-border)" }} />

      {/* Zone list */}
      <div className="space-y-2">
        <p className="text-xs" style={{ color: "var(--color-secondary)" }}>
          {zones.length === 0 ? "No zones on this page" : `${zones.length} zone${zones.length !== 1 ? "s" : ""}`}
        </p>

        {zones.map((zone, index) => {
          const isSelected = state.selectedZoneId === zone.id
          const isPhoto = zone.zone_type !== "text"
          const borderColor = isPhoto ? "var(--color-accent)" : "#2F6F73"

          return (
            <div
              key={zone.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer"
              style={{
                borderColor: isSelected ? borderColor : "var(--color-border)",
                backgroundColor: isSelected
                  ? isPhoto ? "rgba(212, 120, 108, 0.08)" : "rgba(47, 111, 115, 0.08)"
                  : "transparent",
              }}
              onClick={() => selectZone(isSelected ? null : zone.id)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: borderColor }}
                >
                  {isPhoto
                    ? <Image className="w-3 h-3 text-white" />
                    : <Type className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm" style={{ color: "var(--color-neutral)", fontFamily: "var(--font-serif)" }}>
                  Zone {index + 1}
                </span>
                <span className="text-xs" style={{ color: "var(--color-secondary)" }}>
                  {isPhoto ? "Photo" : "Text"}
                </span>
              </div>

              {isSelected && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteSelected() }}
                  className="p-1 rounded text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
