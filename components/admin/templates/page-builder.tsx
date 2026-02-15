"use client"

import { useState } from "react"
import type { LayoutDB } from "@/types/template"
import type { Zone } from "@/types/editor"
import { ZonePreview } from "@/components/ui/zone-preview"

interface PageBuilderProps {
  pageCount: number
  layoutIds: string[] // Ordered array of layout UUIDs, length = pageCount
  layouts: LayoutDB[]
  onChange: (layoutIds: string[]) => void
  disabled?: boolean
}

export function PageBuilder({ pageCount, layoutIds, layouts, onChange, disabled }: PageBuilderProps) {
  const [fillAllId, setFillAllId] = useState(layouts[0]?.id || "")
  const [rangeFrom, setRangeFrom] = useState(1)
  const [rangeTo, setRangeTo] = useState(pageCount)
  const [rangeLayoutId, setRangeLayoutId] = useState(layouts[0]?.id || "")
  const [expandedCell, setExpandedCell] = useState<number | null>(null)

  const getLayoutById = (id: string) => layouts.find((l) => l.id === id)

  const handleFillAll = () => {
    if (!fillAllId) return
    onChange(Array(pageCount).fill(fillAllId))
  }

  const handleFillRange = () => {
    if (!rangeLayoutId) return
    const from = Math.max(1, rangeFrom)
    const to = Math.min(pageCount, rangeTo)
    if (from > to) return
    const newIds = [...layoutIds]
    for (let i = from - 1; i < to; i++) {
      newIds[i] = rangeLayoutId
    }
    onChange(newIds)
  }

  const handleCellChange = (pageIndex: number, layoutId: string) => {
    const newIds = [...layoutIds]
    newIds[pageIndex] = layoutId
    onChange(newIds)
    setExpandedCell(null)
  }

  // Summary: count pages per layout
  const layoutCounts: Record<string, number> = {}
  for (const id of layoutIds) {
    layoutCounts[id] = (layoutCounts[id] || 0) + 1
  }

  return (
    <div className="space-y-5">
      {/* Section A: Bulk Fill Controls */}
      <div
        className="p-4 rounded-lg border space-y-3"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
      >
        {/* Fill All */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--color-neutral)" }}>
            Fill all pages:
          </span>
          <select
            value={fillAllId}
            onChange={(e) => setFillAllId(e.target.value)}
            disabled={disabled}
            className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
            style={{ borderColor: "var(--color-border)" }}
          >
            {layouts.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.zones?.length || 0} zones)
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleFillAll}
            disabled={disabled || !fillAllId}
            className="px-3 py-1.5 rounded-lg text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Apply to All
          </button>
        </div>

        {/* Fill Range */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--color-neutral)" }}>
            Fill range:
          </span>
          <span className="text-sm" style={{ color: "var(--color-secondary)" }}>Pages</span>
          <input
            type="number"
            value={rangeFrom}
            onChange={(e) => setRangeFrom(Number(e.target.value))}
            min={1}
            max={pageCount}
            disabled={disabled}
            className="w-16 px-2 py-1.5 rounded-lg border text-sm text-center disabled:opacity-50"
            style={{ borderColor: "var(--color-border)" }}
          />
          <span className="text-sm" style={{ color: "var(--color-secondary)" }}>–</span>
          <input
            type="number"
            value={rangeTo}
            onChange={(e) => setRangeTo(Number(e.target.value))}
            min={1}
            max={pageCount}
            disabled={disabled}
            className="w-16 px-2 py-1.5 rounded-lg border text-sm text-center disabled:opacity-50"
            style={{ borderColor: "var(--color-border)" }}
          />
          <select
            value={rangeLayoutId}
            onChange={(e) => setRangeLayoutId(e.target.value)}
            disabled={disabled}
            className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
            style={{ borderColor: "var(--color-border)" }}
          >
            {layouts.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.zones?.length || 0} zones)
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleFillRange}
            disabled={disabled || !rangeLayoutId}
            className="px-3 py-1.5 rounded-lg text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Apply
          </button>
        </div>

        {/* Layout usage summary chips */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(layoutCounts).map(([id, count]) => {
            const layout = getLayoutById(id)
            return (
              <span
                key={id}
                className="text-xs px-2 py-1 rounded-full border"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-secondary)",
                  backgroundColor: "var(--color-white)",
                }}
              >
                {layout?.name || "Unknown"}: {count}p
              </span>
            )
          })}
        </div>
      </div>

      {/* Section B: Compact Page Grid */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-secondary)" }}>
          Click any page cell to change its layout individually.
        </p>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
          {layoutIds.map((layoutId, index) => {
            const layout = getLayoutById(layoutId)
            const isExpanded = expandedCell === index

            return (
              <div key={index} className="relative">
                <button
                  type="button"
                  onClick={() => !disabled && setExpandedCell(isExpanded ? null : index)}
                  className="w-full flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors text-center"
                  style={{
                    borderColor: isExpanded ? "var(--color-accent)" : "var(--color-border)",
                    backgroundColor: isExpanded ? "rgba(var(--color-accent-rgb, 212, 120, 108), 0.05)" : "var(--color-white)",
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--color-neutral)" }}
                  >
                    {index + 1}
                  </span>
                  <div className="w-full aspect-[8.5/11]">
                    {layout?.zones ? (
                      <ZonePreview zones={layout.zones as Zone[]} mode="display" />
                    ) : (
                      <div
                        className="w-full h-full rounded border"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                      />
                    )}
                  </div>
                  <span
                    className="text-xs truncate w-full"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    {layout?.name || "—"}
                  </span>
                </button>

                {/* Inline dropdown when cell is expanded */}
                {isExpanded && (
                  <div
                    className="absolute z-10 top-full left-0 mt-1 w-48 rounded-lg border shadow-lg"
                    style={{
                      backgroundColor: "var(--color-white)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    {layouts.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handleCellChange(index, l.id)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                        style={{ color: "var(--color-neutral)" }}
                      >
                        <span className="flex-1">{l.name}</span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-secondary)" }}
                        >
                          {l.zones?.length || 0}z
                        </span>
                        {l.id === layoutId && (
                          <span style={{ color: "var(--color-accent)" }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Info */}
      <div
        className="text-xs p-3 rounded-lg"
        style={{ backgroundColor: "var(--color-background)", color: "var(--color-secondary)" }}
      >
        <strong>Total Pages: {pageCount}</strong> · When a user creates a project from this template,
        each page's zones are copied fresh from the selected layout at that time.
      </div>
    </div>
  )
}
