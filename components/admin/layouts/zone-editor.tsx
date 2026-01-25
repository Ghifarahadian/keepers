"use client"

import { useState, useRef, useCallback } from "react"
import { Plus, Trash2, Move } from "lucide-react"

interface Zone {
  position_x: number
  position_y: number
  width: number
  height: number
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
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [resizing, setResizing] = useState<string | null>(null)

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
    const pos = getMousePosition(e)

    // Check if clicking on existing zone
    const clickedZoneIndex = zones.findIndex(
      (zone) =>
        pos.x >= zone.position_x &&
        pos.x <= zone.position_x + zone.width &&
        pos.y >= zone.position_y &&
        pos.y <= zone.position_y + zone.height
    )

    if (clickedZoneIndex >= 0) {
      setSelectedIndex(clickedZoneIndex)
      const zone = zones[clickedZoneIndex]
      setDragOffset({
        x: pos.x - zone.position_x,
        y: pos.y - zone.position_y,
      })
    } else {
      setSelectedIndex(null)
      setIsDrawing(true)
      setDrawStart(pos)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePosition(e)

    if (isDrawing && drawStart) {
      // Show preview while drawing
      return
    }

    if (dragOffset !== null && selectedIndex !== null && !resizing) {
      // Dragging a zone
      const newZones = [...zones]
      const newX = Math.max(0, Math.min(100 - zones[selectedIndex].width, pos.x - dragOffset.x))
      const newY = Math.max(0, Math.min(100 - zones[selectedIndex].height, pos.y - dragOffset.y))
      newZones[selectedIndex] = {
        ...newZones[selectedIndex],
        position_x: Math.round(newX * 10) / 10,
        position_y: Math.round(newY * 10) / 10,
      }
      onChange(newZones)
    }

    if (resizing && selectedIndex !== null) {
      // Resizing a zone
      const zone = zones[selectedIndex]
      const newZones = [...zones]

      if (resizing.includes("e")) {
        const newWidth = Math.max(5, Math.min(100 - zone.position_x, pos.x - zone.position_x))
        newZones[selectedIndex] = { ...newZones[selectedIndex], width: Math.round(newWidth * 10) / 10 }
      }
      if (resizing.includes("s")) {
        const newHeight = Math.max(5, Math.min(100 - zone.position_y, pos.y - zone.position_y))
        newZones[selectedIndex] = { ...newZones[selectedIndex], height: Math.round(newHeight * 10) / 10 }
      }
      if (resizing.includes("w")) {
        const diff = zone.position_x - pos.x
        const newWidth = Math.max(5, zone.width + diff)
        const newX = Math.max(0, zone.position_x - diff)
        if (newX + newWidth <= 100) {
          newZones[selectedIndex] = {
            ...newZones[selectedIndex],
            position_x: Math.round(newX * 10) / 10,
            width: Math.round(newWidth * 10) / 10,
          }
        }
      }
      if (resizing.includes("n")) {
        const diff = zone.position_y - pos.y
        const newHeight = Math.max(5, zone.height + diff)
        const newY = Math.max(0, zone.position_y - diff)
        if (newY + newHeight <= 100) {
          newZones[selectedIndex] = {
            ...newZones[selectedIndex],
            position_y: Math.round(newY * 10) / 10,
            height: Math.round(newHeight * 10) / 10,
          }
        }
      }

      onChange(newZones)
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
        }
        onChange([...zones, newZone])
        setSelectedIndex(zones.length)
      }
    }

    setIsDrawing(false)
    setDrawStart(null)
    setDragOffset(null)
    setResizing(null)
  }

  const addZone = () => {
    const newZone: Zone = {
      position_x: 10,
      position_y: 10,
      width: 30,
      height: 30,
    }
    onChange([...zones, newZone])
    setSelectedIndex(zones.length)
  }

  const deleteZone = (index: number) => {
    onChange(zones.filter((_, i) => i !== index))
    setSelectedIndex(null)
  }

  const updateZoneValue = (index: number, field: keyof Zone, value: number) => {
    const newZones = [...zones]
    newZones[index] = { ...newZones[index], [field]: value }
    onChange(newZones)
  }

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative border-2 rounded-lg cursor-crosshair select-none"
        style={{
          aspectRatio: "8.5 / 11",
          backgroundColor: "var(--color-white)",
          borderColor: "var(--color-border)",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid overlay */}
        <div
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
          <div
            key={index}
            className={`absolute border-2 ${
              selectedIndex === index ? "ring-2 ring-offset-1" : ""
            }`}
            style={{
              left: `${zone.position_x}%`,
              top: `${zone.position_y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              backgroundColor:
                selectedIndex === index
                  ? "rgba(212, 120, 108, 0.3)"
                  : "rgba(212, 120, 108, 0.15)",
              borderColor: "var(--color-accent)",
              cursor: selectedIndex === index ? "move" : "pointer",
              // @ts-expect-error - Tailwind CSS variable for ring color
              "--tw-ring-color": "var(--color-accent)",
            }}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedIndex(index)
            }}
          >
            {/* Zone index */}
            <span
              className="absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-white)",
              }}
            >
              {index + 1}
            </span>

            {/* Resize handles */}
            {selectedIndex === index && (
              <>
                <div
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded cursor-ew-resize"
                  style={{ backgroundColor: "var(--color-accent)" }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    setResizing("e")
                  }}
                />
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded cursor-ns-resize"
                  style={{ backgroundColor: "var(--color-accent)" }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    setResizing("s")
                  }}
                />
                <div
                  className="absolute -right-1 -bottom-1 w-3 h-3 rounded cursor-nwse-resize"
                  style={{ backgroundColor: "var(--color-accent)" }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    setResizing("se")
                  }}
                />
              </>
            )}
          </div>
        ))}

        {/* Draw preview */}
        {isDrawing && drawStart && (
          <div
            className="absolute border-2 border-dashed pointer-events-none"
            style={{
              left: `${drawStart.x}%`,
              top: `${drawStart.y}%`,
              borderColor: "var(--color-accent)",
              backgroundColor: "rgba(212, 120, 108, 0.1)",
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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addZone}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
        {selectedIndex !== null && (
          <button
            type="button"
            onClick={() => deleteZone(selectedIndex)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-red-500"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Trash2 className="w-4 h-4" />
            Delete Zone
          </button>
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
          <div className="flex items-center gap-2 mb-3">
            <Move className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            <span className="font-medium" style={{ color: "var(--color-neutral)" }}>
              Zone {selectedIndex + 1}
            </span>
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
