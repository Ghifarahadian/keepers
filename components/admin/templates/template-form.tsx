"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createTemplate, updateTemplate, getAdminCategories, getAdminLayouts } from "@/lib/admin-actions"
import type { Template, TemplateCategory, LayoutDB } from "@/types/template"
import type { PageCount, PaperSize } from "@/types/editor"
import { PageBuilder } from "./page-builder"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TemplateFormProps {
  template?: Template
  isEdit?: boolean
}

export function TemplateForm({ template, isEdit }: TemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [layouts, setLayouts] = useState<LayoutDB[]>([])

  const [title, setTitle] = useState(template?.title || "")
  const [slug, setSlug] = useState(template?.slug || "")
  const [description, setDescription] = useState(template?.description || "")
  const [categoryId, setCategoryId] = useState(template?.category_id || "")
  const [thumbnailUrl, setThumbnailUrl] = useState(template?.thumbnail_url || "")
  const [isFeatured, setIsFeatured] = useState(template?.is_featured ?? false)
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [pageCount, setPageCount] = useState<PageCount>(template?.page_count || 30)
  const [paperSize, setPaperSize] = useState<PaperSize>(template?.paper_size || "A4")
  const [layoutIds, setLayoutIds] = useState<string[]>(template?.layout_ids || [])

  // Load categories and layouts
  useEffect(() => {
    async function loadData() {
      const [cats, lays] = await Promise.all([
        getAdminCategories(),
        getAdminLayouts(),
      ])
      setCategories(cats)
      setLayouts(lays)
    }
    loadData()
  }, [])

  // Initialize layoutIds once layouts are loaded (new template only)
  useEffect(() => {
    if (layouts.length > 0 && !isEdit && layoutIds.length === 0) {
      const defaultId = layouts.find((l) => l.is_active)?.id || layouts[0]?.id || ""
      setLayoutIds(Array(pageCount).fill(defaultId))
    }
  }, [layouts, isEdit, layoutIds.length, pageCount])

  // Update layoutIds array when page count changes
  const handlePageCountChange = (newCount: PageCount) => {
    setPageCount(newCount)
    const defaultId = layouts.find((l) => l.is_active)?.id || layouts[0]?.id || ""
    if (newCount > layoutIds.length) {
      setLayoutIds([...layoutIds, ...Array(newCount - layoutIds.length).fill(defaultId)])
    } else {
      setLayoutIds(layoutIds.slice(0, newCount))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (isEdit && template) {
        await updateTemplate(template.id, {
          title,
          description: description || undefined,
          category_id: categoryId || undefined,
          thumbnail_url: thumbnailUrl || undefined,
          is_featured: isFeatured,
          is_active: isActive,
          layout_ids: layoutIds,
        })
      } else {
        await createTemplate({
          slug,
          title,
          description: description || undefined,
          category_id: categoryId || undefined,
          thumbnail_url: thumbnailUrl || undefined,
          page_count: pageCount,
          paper_size: paperSize,
          layout_ids: layoutIds,
          is_featured: isFeatured,
        })
      }
      router.push("/admin/templates")
      router.refresh()
    } catch (err) {
      console.error("Failed to save template:", err)
      setError(err instanceof Error ? err.message : "Failed to save template")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = () => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    setSlug(generatedSlug)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/templates"
          className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--color-border)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--color-neutral)" }} />
        </Link>
        <h1
          className="text-2xl font-bold flex-1"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-neutral)" }}
        >
          {isEdit ? "Edit Template" : "Create Template"}
        </h1>
        <button
          type="submit"
          disabled={isSubmitting || !title || (!isEdit && !slug) || layoutIds.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEdit ? "Save Changes" : "Create Template"}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Fields */}
        <div
          className="p-6 rounded-lg border"
          style={{ backgroundColor: "var(--color-white)", borderColor: "var(--color-border)" }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-neutral)" }}
          >
            Template Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-neutral)" }}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => !isEdit && !slug && generateSlug()}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="e.g., Summer Vacation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-neutral)" }}>
                Slug *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{ borderColor: "var(--color-border)" }}
                  placeholder="e.g., summer-vacation"
                  disabled={isEdit}
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-neutral)" }}>
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-neutral)" }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="Brief description of the template"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-neutral)" }}>
                Thumbnail URL
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="https://..."
              />
              <p className="text-xs mt-1" style={{ color: "var(--color-secondary)" }}>
                Upload to template-assets bucket and paste URL here
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-neutral)" }}>
                Page Count *
              </label>
              <select
                value={pageCount}
                onChange={(e) => handlePageCountChange(Number(e.target.value) as PageCount)}
                disabled={isEdit}
                className="w-full px-4 py-2 rounded-lg border disabled:opacity-50"
                style={{ borderColor: "var(--color-border)" }}
              >
                <option value={30}>30 pages</option>
                <option value={40}>40 pages</option>
              </select>
              {isEdit && (
                <p className="text-xs mt-1" style={{ color: "var(--color-secondary)" }}>
                  Page count cannot be changed in edit mode
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-neutral)" }}>
                Paper Size *
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                disabled={isEdit}
                className="w-full px-4 py-2 rounded-lg border disabled:opacity-50"
                style={{ borderColor: "var(--color-border)" }}
              >
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="PDF Only">PDF Only</option>
              </select>
              {isEdit && (
                <p className="text-xs mt-1" style={{ color: "var(--color-secondary)" }}>
                  Paper size cannot be changed in edit mode
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm" style={{ color: "var(--color-neutral)" }}>
                  Featured
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm" style={{ color: "var(--color-neutral)" }}>
                  Active
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Page Builder */}
        <div
          className="lg:col-span-2 p-6 rounded-lg border"
          style={{ backgroundColor: "var(--color-white)", borderColor: "var(--color-border)" }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-neutral)" }}
          >
            Layout Sequence ({layoutIds.length} pages)
          </h2>
          {layouts.length > 0 && layoutIds.length > 0 ? (
            <PageBuilder
              pageCount={pageCount}
              layoutIds={layoutIds}
              layouts={layouts}
              onChange={setLayoutIds}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2
                className="w-6 h-6 animate-spin"
                style={{ color: "var(--color-secondary)" }}
              />
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
