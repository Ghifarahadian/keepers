"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createTemplate, updateTemplate, getAdminCategories, getAdminLayouts } from "@/lib/admin-actions"
import type { Template, TemplateCategory, LayoutDB, CreateTemplateInput, UpdateTemplateInput } from "@/types/template"
import { PageBuilder } from "./page-builder"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TemplateFormProps {
  template?: Template
  isEdit?: boolean
}

interface PageInput {
  page_number: number
  layout_slug: string
  title?: string
}

export function TemplateForm({ template, isEdit }: TemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [layouts, setLayouts] = useState<LayoutDB[]>([])

  const [name, setName] = useState(template?.name || "")
  const [slug, setSlug] = useState(template?.slug || "")
  const [description, setDescription] = useState(template?.description || "")
  const [categoryId, setCategoryId] = useState(template?.category_id || "")
  const [thumbnailUrl, setThumbnailUrl] = useState(template?.thumbnail_url || "")
  const [isFeatured, setIsFeatured] = useState(template?.is_featured ?? false)
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [pages, setPages] = useState<PageInput[]>(
    template?.template_pages?.map((p) => ({
      page_number: p.page_number,
      layout_slug: p.layout?.slug || "blank",
      title: p.title || undefined,
    })) || [
      { page_number: 1, layout_slug: "blank" },
      { page_number: 2, layout_slug: "blank" },
    ]
  )

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (isEdit && template) {
        const input: UpdateTemplateInput = {
          name,
          description: description || undefined,
          category_id: categoryId || null,
          thumbnail_url: thumbnailUrl || null,
          is_featured: isFeatured,
          is_active: isActive,
        }
        await updateTemplate(template.id, input)
        router.push("/admin/templates")
        router.refresh()
      } else {
        const input: CreateTemplateInput = {
          slug,
          name,
          description: description || undefined,
          category_id: categoryId || undefined,
          thumbnail_url: thumbnailUrl || undefined,
          pages,
        }
        await createTemplate(input)
        router.push("/admin/templates")
        router.refresh()
      }
    } catch (err) {
      console.error("Failed to save template:", err)
      setError(err instanceof Error ? err.message : "Failed to save template")
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
          href="/admin/templates"
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
          {isEdit ? "Edit Template" : "Create Template"}
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
            Template Details
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
                placeholder="e.g., Summer Vacation"
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
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-neutral)" }}
              >
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
                placeholder="Brief description of the template"
                rows={3}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-neutral)" }}
              >
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
            Pages ({pages.length})
          </h2>
          <PageBuilder
            pages={pages}
            layouts={layouts}
            onChange={setPages}
            disabled={isEdit}
          />
          {isEdit && (
            <p className="text-sm mt-4" style={{ color: "var(--color-secondary)" }}>
              Page editing is disabled in edit mode. To modify pages, delete and recreate the template.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
