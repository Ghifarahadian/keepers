import { getAdminLayouts, getAdminTemplates, getAdminCategories } from "@/lib/admin-actions"
import { LayoutGrid, FileText, Folder } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const [layouts, templates, categories] = await Promise.all([
    getAdminLayouts(),
    getAdminTemplates(),
    getAdminCategories(),
  ])

  const stats = [
    {
      label: "Layouts",
      value: layouts.length,
      href: "/admin/layouts",
      icon: LayoutGrid,
      description: "Page layout templates",
    },
    {
      label: "Templates",
      value: templates.length,
      href: "/admin/templates",
      icon: FileText,
      description: "Photobook templates",
    },
    {
      label: "Categories",
      value: categories.length,
      href: "/admin/categories",
      icon: Folder,
      description: "Template categories",
    },
  ]

  return (
    <div>
      <h1
        className="text-2xl font-bold mb-8"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--color-neutral)",
        }}
      >
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-6 rounded-lg border transition-shadow hover:shadow-md"
              style={{
                backgroundColor: "var(--color-white)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "var(--color-neutral)",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs mt-2"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    {stat.description}
                  </p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-background)" }}
                >
                  <Icon
                    className="w-6 h-6"
                    style={{ color: "var(--color-accent)" }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
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
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/layouts/new"
            className="px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Create Layout
          </Link>
          <Link
            href="/admin/templates/new"
            className="px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Create Template
          </Link>
          <Link
            href="/admin/categories"
            className="px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--color-border)" }}
          >
            Manage Categories
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="mt-6 p-6 rounded-lg border"
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
          System Layouts
        </h2>
        <div className="space-y-2">
          {layouts.filter(l => l.is_system).map((layout) => (
            <div
              key={layout.id}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-background)" }}
            >
              <div>
                <p
                  className="font-medium"
                  style={{ color: "var(--color-neutral)" }}
                >
                  {layout.name}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-secondary)" }}
                >
                  {layout.layout_zones?.length || 0} zones
                </p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-white)",
                }}
              >
                System
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
