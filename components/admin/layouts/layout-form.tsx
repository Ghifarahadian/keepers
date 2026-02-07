"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createLayout, updateLayout } from "@/lib/admin-actions"
import type { LayoutDB, CreateLayoutInput, UpdateLayoutInput } from "@/types/template"
import { ZoneEditor, type Zone } from "./zone-editor"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface LayoutFormProps {
  layout?: LayoutDB
  isEdit?: boolean
}

export function LayoutForm({ layout, isEdit }: LayoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(layout?.name || "")
  const [slug, setSlug] = useState(layout?.slug || "")
  const [description, setDescription] = useState(layout?.description || "")
  const [icon, setIcon] = useState(layout?.icon || "")
  const [isActive, setIsActive] = useState(layout?.is_active ?? true)
  const [zones, setZones] = useState<Zone[]>(
    layout?.layout_zones?.map((z) => ({
      position_x: z.position_x,
      position_y: z.position_y,
      width: z.width,
      height: z.height,
      zone_type: z.zone_type || "photo",
    })) || []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (isEdit && layout) {
        const input: UpdateLayoutInput = {
          name,
          description: description || undefined,
          icon: icon || undefined,
          is_active: isActive,
          zones,
        }
        await updateLayout(layout.id, input)
        router.push("/admin/layouts")
        router.refresh()
      } else {
        const input: CreateLayoutInput = {
          slug,
          name,
          description: description || undefined,
          icon: icon || undefined,
          zones,
        }
        await createLayout(input)
        router.push("/admin/layouts")
        router.refresh()
      }
    } catch (err) {
      console.error("Failed to save layout:", err)
      setError(err instanceof Error ? err.message : "Failed to save layout")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = () => {
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    setSlug(generatedSlug)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/layouts"
          className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--color-border)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--color-neutral)" }} />
        </Link>
        <h1
          className="text-2xl font-bold flex-1"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-neutral)",
          }}
        >
          {isEdit ? "Edit Layout" : "Create Layout"}
        </h1>
        <button
          type="submit"
          disabled={isSubmitting || !name || (!isEdit && !slug)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEdit ? "Save Changes" : "Create Layout"}
        </button>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-lg border"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgb(239, 68, 68)",
            color: "rgb(239, 68, 68)",
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Fields */}
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: "var(--color-white)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-neutral)",
            }}
          >
            Layout Details
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-neutral)" }}
              >
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => !isEdit && !slug && generateSlug()}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="e.g., Full Bleed"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-neutral)" }}
              >
                Slug *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{ borderColor: "var(--color-border)" }}
                  placeholder="e.g., full-bleed"
                  disabled={isEdit && layout?.is_system}
                  required
                />
                {!isEdit && (
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    Generate
                  </button>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--color-secondary)" }}>
                Used to reference this layout in code
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-neutral)" }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="Brief description of the layout"
                rows={3}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-neutral)" }}
              >
                Icon (Lucide name)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="e.g., Grid, Layout, Square"
              />
            </div>

            {isEdit && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm"
                  style={{ color: "var(--color-neutral)" }}
                >
                  Active (visible to users)
                </label>
              </div>
            )}

            {layout?.is_system && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{ backgroundColor: "var(--color-background)" }}
              >
                <strong>System Layout:</strong> Some fields cannot be modified.
              </div>
            )}
          </div>
        </div>

        {/* Zone Editor */}
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: "var(--color-white)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-neutral)",
            }}
          >
            Zone Editor
          </h2>
          <ZoneEditor zones={zones} onChange={setZones} />
        </div>
      </div>
    </form>
  )
}
