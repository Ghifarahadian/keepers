"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit, Check, X } from "lucide-react"
import type { TemplateCategory } from "@/types/template"
import { createCategory, updateCategory, deleteCategory } from "@/lib/admin-actions"

interface CategoryListProps {
  categories: TemplateCategory[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newCategory, setNewCategory] = useState({ slug: "", name: "", description: "", icon: "" })
  const [editValues, setEditValues] = useState({ name: "", description: "", icon: "" })

  const handleCreate = async () => {
    if (!newCategory.slug || !newCategory.name) return

    try {
      await createCategory({
        slug: newCategory.slug,
        name: newCategory.name,
        description: newCategory.description || undefined,
        icon: newCategory.icon || undefined,
      })
      setNewCategory({ slug: "", name: "", description: "", icon: "" })
      setIsCreating(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create category:", error)
      alert("Failed to create category")
    }
  }

  const startEdit = (cat: TemplateCategory) => {
    setEditingId(cat.id)
    setEditValues({
      name: cat.name,
      description: cat.description || "",
      icon: cat.icon || "",
    })
  }

  const handleUpdate = async (id: string) => {
    try {
      await updateCategory(id, {
        name: editValues.name,
        description: editValues.description || undefined,
        icon: editValues.icon || undefined,
      })
      setEditingId(null)
      router.refresh()
    } catch (error) {
      console.error("Failed to update category:", error)
      alert("Failed to update category")
    }
  }

  const handleDelete = async (cat: TemplateCategory) => {
    if (!confirm(`Are you sure you want to delete "${cat.name}"?`)) {
      return
    }

    setDeleting(cat.id)
    try {
      await deleteCategory(cat.id)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete category:", error)
      alert("Failed to delete category")
    } finally {
      setDeleting(null)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  return (
    <div
      className="rounded-lg border"
      style={{
        backgroundColor: "var(--color-white)",
        borderColor: "var(--color-border)",
      }}
    >
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: "var(--color-background)" }}>
            <th
              className="px-6 py-3 text-left text-sm font-semibold"
              style={{ color: "var(--color-neutral)" }}
            >
              Name
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold"
              style={{ color: "var(--color-neutral)" }}
            >
              Slug
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold"
              style={{ color: "var(--color-neutral)" }}
            >
              Description
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold"
              style={{ color: "var(--color-neutral)" }}
            >
              Icon
            </th>
            <th
              className="px-6 py-3 text-right text-sm font-semibold"
              style={{ color: "var(--color-neutral)" }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr
              key={cat.id}
              className="border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              {editingId === cat.id ? (
                <>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, name: e.target.value })
                      }
                      className="w-full px-2 py-1 rounded border"
                      style={{ borderColor: "var(--color-border)" }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <code
                      className="text-sm px-2 py-1 rounded"
                      style={{ backgroundColor: "var(--color-background)" }}
                    >
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editValues.description}
                      onChange={(e) =>
                        setEditValues({ ...editValues, description: e.target.value })
                      }
                      className="w-full px-2 py-1 rounded border"
                      style={{ borderColor: "var(--color-border)" }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editValues.icon}
                      onChange={(e) =>
                        setEditValues({ ...editValues, icon: e.target.value })
                      }
                      className="w-24 px-2 py-1 rounded border"
                      style={{ borderColor: "var(--color-border)" }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="p-2 rounded-lg border transition-colors hover:bg-green-50"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <Check
                          className="w-4 h-4"
                          style={{ color: "rgb(34, 197, 94)" }}
                        />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <X
                          className="w-4 h-4"
                          style={{ color: "var(--color-secondary)" }}
                        />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4">
                    <span
                      className="font-medium"
                      style={{ color: "var(--color-neutral)" }}
                    >
                      {cat.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code
                      className="text-sm px-2 py-1 rounded"
                      style={{ backgroundColor: "var(--color-background)" }}
                    >
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-secondary)" }}
                    >
                      {cat.description || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-secondary)" }}
                    >
                      {cat.icon || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <Edit
                          className="w-4 h-4"
                          style={{ color: "var(--color-neutral)" }}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deleting === cat.id}
                        className="p-2 rounded-lg border transition-colors hover:bg-red-50 disabled:opacity-50"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <Trash2
                          className="w-4 h-4"
                          style={{ color: "rgb(239, 68, 68)" }}
                        />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}

          {/* New category row */}
          {isCreating && (
            <tr
              className="border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => {
                    setNewCategory({
                      ...newCategory,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  className="w-full px-2 py-1 rounded border"
                  style={{ borderColor: "var(--color-border)" }}
                  placeholder="Category name"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, slug: e.target.value })
                  }
                  className="w-full px-2 py-1 rounded border"
                  style={{ borderColor: "var(--color-border)" }}
                  placeholder="slug"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, description: e.target.value })
                  }
                  className="w-full px-2 py-1 rounded border"
                  style={{ borderColor: "var(--color-border)" }}
                  placeholder="Description"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, icon: e.target.value })
                  }
                  className="w-24 px-2 py-1 rounded border"
                  style={{ borderColor: "var(--color-border)" }}
                  placeholder="Icon"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={!newCategory.slug || !newCategory.name}
                    className="p-2 rounded-lg border transition-colors hover:bg-green-50 disabled:opacity-50"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <Check
                      className="w-4 h-4"
                      style={{ color: "rgb(34, 197, 94)" }}
                    />
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewCategory({ slug: "", name: "", description: "", icon: "" })
                    }}
                    className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <X
                      className="w-4 h-4"
                      style={{ color: "var(--color-secondary)" }}
                    />
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add button */}
      {!isCreating && (
        <div className="p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      )}

      {categories.length === 0 && !isCreating && (
        <div className="p-12 text-center">
          <p style={{ color: "var(--color-secondary)" }}>
            No categories found. Add your first category to organize templates.
          </p>
        </div>
      )}
    </div>
  )
}
