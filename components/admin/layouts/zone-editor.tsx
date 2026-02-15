"use client"

import { useState, useRef, useCallback } from "react"
import { Trash2, Image, Type, X } from "lucide-react"
import { ZoneBox } from "@/components/ui/zone-box"

export type ZoneType = "photo" | "text"

export interface Zone {
  position_x: number
  position_y: number
  width: number
  height: number
  zone_type: ZoneType
}

interface ZoneEditorProps {
  zones: Zone[]
  onChange: (zones: Zone[]) => void
}

export function ZoneEditor({ zones, onChange }: ZoneEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null)
  const [newZoneType, setNewZoneType] = useState<ZoneType>("photo")

  const getMousePosition = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return

    // Only start drawing if clicking on empty canvas
    const target = e.target as HTMLElement
    if (target === canvasRef.current || target.closest('[data-grid-overlay]')) {
      const pos = getMousePosition(e)
      setSelectedIndex(null)
      setIsDrawing(true)
      setDrawStart(pos)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing && drawStart) {
      const pos = getMousePosition(e)
      setDrawCurrent(pos)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDrawing && drawStart) {
      const pos = getMousePosition(e)
      const x = Math.min(drawStart.x, pos.x)
      const y = Math.min(drawStart.y, pos.y)
      const width = Math.abs(pos.x - drawStart.x)
      const height = Math.abs(pos.y - drawStart.y)

      if (width >= 5 && height >= 5) {
        const newZone: Zone = {
          position_x: Math.round(x * 10) / 10,
          position_y: Math.round(y * 10) / 10,
          width: Math.round(width * 10) / 10,
          height: Math.round(height * 10) / 10,
          zone_type: newZoneType,
        }
        onChange([...zones, newZone])
        setSelectedIndex(zones.length)
      }
    }

    setIsDrawing(false)
    setDrawStart(null)
    setDrawCurrent(null)
  }

  const deleteZone = (index: number) => {
    onChange(zones.filter((_, i) => i !== index))
    setSelectedIndex(null)
  }

  const updateZone = useCallback((index: number, updates: Partial<Zone>) => {
    const newZones = [...zones]
    newZones[index] = { ...newZones[index], ...updates }
    onChange(newZones)
  }, [zones, onChange])

  const updateZoneValue = (index: number, field: keyof Zone, value: number | ZoneType) => {
    const newZones = [...zones]
    newZones[index] = { ...newZones[index], [field]: value }
    onChange(newZones)
  }

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative rounded-lg cursor-crosshair select-none mx-auto"
        style={{
          aspectRatio: "8.5 / 11",
          backgroundColor: "var(--color-white)",
          boxShadow: "inset 0 0 0 2px var(--color-border)",
          width: "min(495px, 95%)",
          maxHeight: "85vh",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid overlay */}
        <div
          data-grid-overlay
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "10% 10%",
          }}
        />

        {/* Zones */}
        {zones.map((zone, index) => (
          <ZoneBox
            key={index}
            zone={zone}
            mode="admin"
            index={index}
            isSelected={selectedIndex === index}
            canvasRef={canvasRef}
            onUpdate={(updates) => updateZone(index, updates)}
            onSelect={() => setSelectedIndex(index)}
          />
        ))}

        {/* Draw preview */}
        {isDrawing && drawStart && drawCurrent && (
          <div
            className="absolute border-2 border-dashed pointer-events-none"
            style={{
              left: `${Math.min(drawStart.x, drawCurrent.x)}%`,
              top: `${Math.min(drawStart.y, drawCurrent.y)}%`,
              width: `${Math.abs(drawCurrent.x - drawStart.x)}%`,
              height: `${Math.abs(drawCurrent.y - drawStart.y)}%`,
              borderColor: newZoneType === "photo" ? "var(--color-accent)" : "#2F6F73",
              backgroundColor: newZoneType === "photo" ? "rgba(212, 120, 108, 0.1)" : "rgba(47, 111, 115, 0.1)",
            }}
          />
        )}

        {zones.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
              Click and drag to draw zones
            </p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Zone type selector for drawing */}
        <div className="flex items-center gap-1 mr-2">
          <span className="text-xs" style={{ color: "var(--color-secondary)" }}>Draw:</span>
          <button
            type="button"
            onClick={() => setNewZoneType("photo")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              newZoneType === "photo" ? "text-white" : ""
            }`}
            style={{
              backgroundColor: newZoneType === "photo" ? "var(--color-accent)" : "transparent",
              border: `1px solid var(--color-accent)`,
              color: newZoneType === "photo" ? "white" : "var(--color-accent)",
            }}
          >
            <Image className="w-3 h-3" />
            Photo
          </button>
          <button
            type="button"
            onClick={() => setNewZoneType("text")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              newZoneType === "text" ? "text-white" : ""
            }`}
            style={{
              backgroundColor: newZoneType === "text" ? "#2F6F73" : "transparent",
              border: "1px solid #2F6F73",
              color: newZoneType === "text" ? "white" : "#2F6F73",
            }}
          >
            <Type className="w-3 h-3" />
            Text
          </button>
        </div>

        {selectedIndex !== null && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-neutral)" }}
            >
              <X className="w-4 h-4" />
              Deselect
            </button>
            <button
              type="button"
              onClick={() => deleteZone(selectedIndex)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-red-500"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Trash2 className="w-4 h-4" />
              Delete Zone
            </button>
          </>
        )}
      </div>

      {/* Zone details */}
      {selectedIndex !== null && zones[selectedIndex] && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: "var(--color-neutral)" }}>
                Zone {selectedIndex + 1}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateZoneValue(selectedIndex, "zone_type", "photo")}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs`}
                style={{
                  backgroundColor: zones[selectedIndex].zone_type === "photo" ? "var(--color-accent)" : "transparent",
                  border: `1px solid var(--color-accent)`,
                  color: zones[selectedIndex].zone_type === "photo" ? "white" : "var(--color-accent)",
                }}
              >
                <Image className="w-3 h-3" />
                Photo
              </button>
              <button
                type="button"
                onClick={() => updateZoneValue(selectedIndex, "zone_type", "text")}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs`}
                style={{
                  backgroundColor: zones[selectedIndex].zone_type === "text" ? "#2F6F73" : "transparent",
                  border: "1px solid #2F6F73",
                  color: zones[selectedIndex].zone_type === "text" ? "white" : "#2F6F73",
                }}
              >
                <Type className="w-3 h-3" />
                Text
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-secondary)" }}>
                X Position (%)
              </label>
              <input
                type="number"
                value={zones[selectedIndex].position_x}
                onChange={(e) =>
                  updateZoneValue(selectedIndex, "position_x", parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-sm rounded border"
                style={{ borderColor: "var(--color-border)" }}
                min={0}
                max={100}
                step={0.5}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-secondary)" }}>
                Y Position (%)
              </label>
              <input
                type="number"
                value={zones[selectedIndex].position_y}
                onChange={(e) =>
                  updateZoneValue(selectedIndex, "position_y", parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-sm rounded border"
                style={{ borderColor: "var(--color-border)" }}
                min={0}
                max={100}
                step={0.5}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-secondary)" }}>
                Width (%)
              </label>
              <input
                type="number"
                value={zones[selectedIndex].width}
                onChange={(e) =>
                  updateZoneValue(selectedIndex, "width", parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-sm rounded border"
                style={{ borderColor: "var(--color-border)" }}
                min={5}
                max={100}
                step={0.5}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-secondary)" }}>
                Height (%)
              </label>
              <input
                type="number"
                value={zones[selectedIndex].height}
                onChange={(e) =>
                  updateZoneValue(selectedIndex, "height", parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-sm rounded border"
                style={{ borderColor: "var(--color-border)" }}
                min={5}
                max={100}
                step={0.5}
              />
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        className="text-xs p-3 rounded-lg"
        style={{
          backgroundColor: "var(--color-background)",
          color: "var(--color-secondary)",
        }}
      >
        <strong>Tips:</strong> Draw zones by clicking and dragging on the canvas. Click a zone to
        select it, then drag to move or use handles to resize.
      </div>
    </div>
  )
}
