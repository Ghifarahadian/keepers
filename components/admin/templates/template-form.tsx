"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createTemplate, updateTemplate, updateTemplatePage, getAdminCategories, getAdminLayouts } from "@/lib/admin-actions"
import type { Project } from "@/types/editor"
import type { TemplateCategory, LayoutDB } from "@/types/template"
import { PageBuilder } from "./page-builder"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TemplateFormProps {
  template?: Project
  isEdit?: boolean
}

interface PageInput {
  page_number: number
  layout_slug: string
  title?: string
  id?: string // Page ID for edit mode
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
  const [pageCount, setPageCount] = useState<30 | 40>(template?.page_count || 30)
  const [pages, setPages] = useState<PageInput[]>([])
  const [changedPageLayouts, setChangedPageLayouts] = useState<Map<string, string>>(new Map())

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

  // Initialize pages when layouts load
  useEffect(() => {
    if (layouts.length > 0 && pages.length === 0) {
      if (!isEdit) {
        // New template: Generate pages based on page count with default layout
        const defaultLayout = layouts.find((l) => l.is_active) || layouts[0]
        const defaultSlug = defaultLayout?.slug || "blank"

        const initialPages: PageInput[] = []
        for (let i = 1; i <= pageCount; i++) {
          initialPages.push({
            page_number: i,
            layout_slug: defaultSlug,
          })
        }
        setPages(initialPages)
      } else if (template?.pages) {
        // Edit mode: Read layout_slug directly from pages
        const initialPages = template.pages.map((p) => ({
          page_number: p.page_number,
          layout_slug: p.layout_slug || "blank", // Use stored layout_slug or default to blank
          title: p.title || undefined,
          id: p.id,
        }))

        setPages(initialPages)
      }
    }
  }, [layouts, isEdit, pages.length, pageCount, template])

  // Update pages when page count changes
  const handlePageCountChange = (newCount: 30 | 40) => {
    setPageCount(newCount)

    // Get the current default layout for new pages
    const defaultLayout = layouts.find((l) => l.is_active) || layouts[0]
    const defaultSlug = defaultLayout?.slug || "blank"

    if (newCount > pages.length) {
      // Add more pages
      const newPages = [...pages]
      for (let i = pages.length + 1; i <= newCount; i++) {
        newPages.push({
          page_number: i,
          layout_slug: defaultSlug,
        })
      }
      setPages(newPages)
    } else if (newCount < pages.length) {
      // Remove extra pages
      setPages(pages.slice(0, newCount))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (isEdit && template) {
        // Update template metadata
        await updateTemplate(template.id, {
          title,
          description: description || undefined,
          category_id: categoryId || undefined,
          thumbnail_url: thumbnailUrl || undefined,
          is_featured: isFeatured,
          is_active: isActive,
        })

        // Update layouts for changed pages
        if (changedPageLayouts.size > 0) {
          const updatePromises = Array.from(changedPageLayouts.entries()).map(
            ([pageId, layoutSlug]) => updateTemplatePage(pageId, layoutSlug)
          )
          await Promise.all(updatePromises)
        }

        router.push("/admin/templates")
        router.refresh()
      } else {
        await createTemplate({
          slug,
          title,
          description: description || undefined,
          category_id: categoryId || undefined,
          thumbnail_url: thumbnailUrl || undefined,
          page_count: pageCount,
          paper_size: "A4",
          pages,
        })
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
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    setSlug(generatedSlug)
  }

  // Handle page changes and track layout changes in edit mode
  const handlePagesChange = (newPages: PageInput[]) => {
    if (isEdit) {
      // Track which pages had their layout changed
      const newChangedLayouts = new Map(changedPageLayouts)

      newPages.forEach((newPage, index) => {
        const oldPage = pages[index]
        if (oldPage && newPage.id && oldPage.layout_slug !== newPage.layout_slug) {
          newChangedLayouts.set(newPage.id, newPage.layout_slug)
        }
      })

      setChangedPageLayouts(newChangedLayouts)
    }
    setPages(newPages)
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
          disabled={isSubmitting || !title || (!isEdit && !slug)}
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

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-neutral)" }}
              >
                Page Count *
              </label>
              <select
                value={pageCount}
                onChange={(e) => handlePageCountChange(Number(e.target.value) as 30 | 40)}
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
            onChange={handlePagesChange}
            disabled={false}
            allowManualPageManagement={!isEdit}
            allowLayoutChange={true}
          />
          {isEdit && (
            <p className="text-sm mt-4" style={{ color: "var(--color-secondary)" }}>
              You can change the layout for any page. Zones will be updated when you save. Page count cannot be changed.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
