import Link from "next/link"
import { getAdminLayouts } from "@/lib/admin-actions"
import { LayoutList } from "@/components/admin/layouts/layout-list"
import { Plus } from "lucide-react"

export default async function LayoutsPage() {
  const layouts = await getAdminLayouts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-2xl font-bold"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-neutral)",
          }}
        >
          Layouts
        </h1>
        <Link
          href="/admin/layouts/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          <Plus className="w-4 h-4" />
          New Layout
        </Link>
      </div>

      <LayoutList layouts={layouts} />
    </div>
  )
}
