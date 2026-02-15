"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Star, Eye, EyeOff } from "lucide-react"
import type { Template } from "@/types/template"
import { deleteTemplate, updateTemplate } from "@/lib/admin-actions"
import { useState } from "react"

interface TemplateListProps {
  templates: Template[]
}

export function TemplateList({ templates }: TemplateListProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const handleDelete = async (template: Template) => {
    if (!confirm(`Are you sure you want to delete "${template.title}"?`)) {
      return
    }

    setDeleting(template.id)
    try {
      await deleteTemplate(template.id)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete template:", error)
      alert("Failed to delete template")
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleFeatured = async (template: Template) => {
    setToggling(template.id)
    try {
      await updateTemplate(template.id, { is_featured: !template.is_featured })
      router.refresh()
    } catch (error) {
      console.error("Failed to update template:", error)
    } finally {
      setToggling(null)
    }
  }

  const handleToggleActive = async (template: Template) => {
    setToggling(template.id)
    try {
      await updateTemplate(template.id, { is_active: !template.is_active })
      router.refresh()
    } catch (error) {
      console.error("Failed to update template:", error)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div
          key={template.id}
          className="rounded-lg border overflow-hidden transition-shadow hover:shadow-md"
          style={{
            backgroundColor: "var(--color-white)",
            borderColor: "var(--color-border)",
          }}
        >
          {/* Thumbnail */}
          <div
            className="aspect-[4/3] relative"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            {template.thumbnail_url ? (
              <img
                src={template.thumbnail_url}
                alt={template.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span style={{ color: "var(--color-secondary)" }}>
                  No thumbnail
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-2">
              {template.is_featured && (
                <span
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: "rgba(234, 179, 8, 0.9)",
                    color: "white",
                  }}
                >
                  <Star className="w-3 h-3" />
                  Featured
                </span>
              )}
              {!template.is_active && (
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.9)",
                    color: "white",
                  }}
                >
                  Inactive
                </span>
              )}
            </div>

            {/* Category badge */}
            {template.category && (
              <div className="absolute bottom-2 left-2">
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                  }}
                >
                  {template.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3
              className="font-semibold mb-1"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-neutral)",
              }}
            >
              {template.title}
            </h3>
            {template.description && (
              <p
                className="text-sm mb-3 line-clamp-2"
                style={{ color: "var(--color-secondary)" }}
              >
                {template.description}
              </p>
            )}
            <p className="text-xs mb-4" style={{ color: "var(--color-secondary)" }}>
              {template.page_count} pages
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleFeatured(template)}
                  disabled={toggling === template.id}
                  className="p-2 rounded-lg border transition-colors hover:bg-gray-50 disabled:opacity-50"
                  style={{ borderColor: "var(--color-border)" }}
                  title={template.is_featured ? "Remove from featured" : "Add to featured"}
                >
                  <Star
                    className="w-4 h-4"
                    style={{
                      color: template.is_featured
                        ? "rgb(234, 179, 8)"
                        : "var(--color-secondary)",
                      fill: template.is_featured ? "rgb(234, 179, 8)" : "none",
                    }}
                  />
                </button>
                <button
                  onClick={() => handleToggleActive(template)}
                  disabled={toggling === template.id}
                  className="p-2 rounded-lg border transition-colors hover:bg-gray-50 disabled:opacity-50"
                  style={{ borderColor: "var(--color-border)" }}
                  title={template.is_active ? "Deactivate" : "Activate"}
                >
                  {template.is_active ? (
                    <Eye
                      className="w-4 h-4"
                      style={{ color: "rgb(34, 197, 94)" }}
                    />
                  ) : (
                    <EyeOff
                      className="w-4 h-4"
                      style={{ color: "var(--color-secondary)" }}
                    />
                  )}
                </button>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/templates/${template.id}`}
                  className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Edit
                    className="w-4 h-4"
                    style={{ color: "var(--color-neutral)" }}
                  />
                </Link>
                <button
                  onClick={() => handleDelete(template)}
                  disabled={deleting === template.id}
                  className="p-2 rounded-lg border transition-colors hover:bg-red-50 disabled:opacity-50"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Trash2
                    className="w-4 h-4"
                    style={{ color: "rgb(239, 68, 68)" }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {templates.length === 0 && (
        <div className="col-span-full p-12 text-center">
          <p style={{ color: "var(--color-secondary)" }}>
            No templates found. Create your first template to get started.
          </p>
        </div>
      )}
    </div>
  )
}
