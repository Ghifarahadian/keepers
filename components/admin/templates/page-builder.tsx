"use client"

import { Plus, Trash2, GripVertical } from "lucide-react"
import type { LayoutDB } from "@/types/template"
import type { Zone } from "@/types/editor"
import { ZonePreview } from "@/components/ui/zone-preview"

interface PageInput {
  page_number: number
  layout_slug: string
  title?: string
  id?: string // Page ID for edit mode
}

interface PageBuilderProps {
  pages: PageInput[]
  layouts: LayoutDB[]
  onChange: (pages: PageInput[]) => void
  disabled?: boolean
  allowManualPageManagement?: boolean
  allowLayoutChange?: boolean
}

export function PageBuilder({ pages, layouts, onChange, disabled, allowManualPageManagement = true, allowLayoutChange = true }: PageBuilderProps) {
  // Get default layout for new pages (first active layout or first layout)
  const getDefaultLayoutSlug = () => {
    const defaultLayout = layouts.find((l) => l.is_active) || layouts[0]
    return defaultLayout?.slug || "blank"
  }

  const addPage = () => {
    const newPage: PageInput = {
      page_number: pages.length + 1,
      layout_slug: getDefaultLayoutSlug(),
    }
    onChange([...pages, newPage])
  }

  const removePage = (index: number) => {
    const newPages = pages
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, page_number: i + 1 }))
    onChange(newPages)
  }

  const updatePage = (index: number, field: keyof PageInput, value: string) => {
    const newPages = [...pages]
    newPages[index] = { ...newPages[index], [field]: value }
    onChange(newPages)
  }

  const getLayoutPreview = (layoutSlug: string) => {
    const layout = layouts.find((l) => l.slug === layoutSlug)
    if (!layout || !layout.zones) return null

    return <ZonePreview zones={layout.zones as Zone[]} mode="display" />
  }

  return (
    <div className="space-y-4">
      {/* Pages List */}
      <div className="space-y-3">
        {pages.map((page, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg border"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Drag handle */}
            <div className="cursor-grab" style={{ color: "var(--color-secondary)" }}>
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Page number */}
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-white)",
              }}
            >
              {page.page_number}
            </span>

            {/* Layout preview */}
            {getLayoutPreview(page.layout_slug)}

            {/* Layout selector */}
            <select
              value={page.layout_slug}
              onChange={(e) => updatePage(index, "layout_slug", e.target.value)}
              disabled={disabled || !allowLayoutChange}
              className="flex-1 px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
              style={{ borderColor: "var(--color-border)" }}
            >
              {layouts.map((layout) => (
                <option key={layout.id} value={layout.slug}>
                  {layout.name} ({layout.zones?.length || 0} zones)
                </option>
              ))}
            </select>

            {/* Page title */}
            <input
              type="text"
              value={page.title || ""}
              onChange={(e) => updatePage(index, "title", e.target.value)}
              disabled={disabled}
              className="w-32 px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
              style={{ borderColor: "var(--color-border)" }}
              placeholder="Page title"
            />

            {/* Remove button */}
            {!disabled && allowManualPageManagement && pages.length > 2 && (
              <button
                type="button"
                onClick={() => removePage(index)}
                className="p-2 rounded-lg border transition-colors hover:bg-red-50"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Trash2 className="w-4 h-4" style={{ color: "rgb(239, 68, 68)" }} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Page Button */}
      {!disabled && allowManualPageManagement && (
        <button
          type="button"
          onClick={addPage}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Plus className="w-4 h-4" style={{ color: "var(--color-secondary)" }} />
          <span style={{ color: "var(--color-secondary)" }}>Add Page</span>
        </button>
      )}

      {/* Info */}
      <div
        className="text-xs p-3 rounded-lg"
        style={{
          backgroundColor: "var(--color-background)",
          color: "var(--color-secondary)",
        }}
      >
        <strong>Total Pages: {pages.length}</strong>
        <br />
        <strong>Note:</strong> {allowManualPageManagement
          ? "Each page can have a different layout. Zones from the selected layout will be copied to the page when the template is created."
          : "Page count is controlled by the 'Page Count' setting above. Each page can have a different layout, and zones from the selected layout will be copied to the page when the template is created."}
      </div>
    </div>
  )
}
