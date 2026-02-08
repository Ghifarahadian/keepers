"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Trash2 } from "lucide-react"
import type { LayoutDB } from "@/types/template"
import type { Zone } from "@/types/editor"
import { deleteLayout } from "@/lib/admin-actions"
import { useState } from "react"

interface LayoutListProps {
  layouts: LayoutDB[]
}

export function LayoutList({ layouts }: LayoutListProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (layout: LayoutDB) => {
    if (layout.is_system) {
      alert("Cannot delete system layouts")
      return
    }

    if (!confirm(`Are you sure you want to delete "${layout.name}"?`)) {
      return
    }

    setDeleting(layout.id)
    try {
      await deleteLayout(layout.id)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete layout:", error)
      alert("Failed to delete layout")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
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
              Preview
            </th>
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
              Zones
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold"
              style={{ color: "var(--color-neutral)" }}
            >
              Status
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
          {layouts.map((layout) => (
            <tr
              key={layout.id}
              className="border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <td className="px-6 py-4">
                {/* Layout Preview */}
                <div
                  className="w-16 h-20 border rounded relative overflow-hidden"
                  style={{
                    backgroundColor: "var(--color-white)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  {layout.zones?.map((zone: Zone, index: number) => (
                    <div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${zone.position_x}%`,
                        top: `${zone.position_y}%`,
                        width: `${zone.width}%`,
                        height: `${zone.height}%`,
                        backgroundColor: zone.zone_type === "text" ? "var(--color-accent)" : "var(--color-secondary)",
                        opacity: 0.6,
                      }}
                    />
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <p
                  className="font-medium"
                  style={{
                    color: "var(--color-neutral)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {layout.name}
                </p>
                {layout.description && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    {layout.description}
                  </p>
                )}
              </td>
              <td className="px-6 py-4">
                <code
                  className="text-sm px-2 py-1 rounded"
                  style={{ backgroundColor: "var(--color-background)" }}
                >
                  {layout.slug}
                </code>
              </td>
              <td className="px-6 py-4">
                <span style={{ color: "var(--color-neutral)" }}>
                  {layout.zones?.length || 0}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {layout.is_system && (
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "var(--color-white)",
                      }}
                    >
                      System
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: layout.is_active
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                      color: layout.is_active
                        ? "rgb(34, 197, 94)"
                        : "rgb(239, 68, 68)",
                    }}
                  >
                    {layout.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/layouts/${layout.id}`}
                    className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <Edit
                      className="w-4 h-4"
                      style={{ color: "var(--color-neutral)" }}
                    />
                  </Link>
                  {!layout.is_system && (
                    <button
                      onClick={() => handleDelete(layout)}
                      disabled={deleting === layout.id}
                      className="p-2 rounded-lg border transition-colors hover:bg-red-50 disabled:opacity-50"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <Trash2
                        className="w-4 h-4"
                        style={{ color: "rgb(239, 68, 68)" }}
                      />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {layouts.length === 0 && (
        <div className="p-12 text-center">
          <p style={{ color: "var(--color-secondary)" }}>
            No layouts found. Create your first layout to get started.
          </p>
        </div>
      )}
    </div>
  )
}
