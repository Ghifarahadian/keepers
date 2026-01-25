import Link from "next/link"
import { getAdminTemplates } from "@/lib/admin-actions"
import { TemplateList } from "@/components/admin/templates/template-list"
import { Plus } from "lucide-react"

export default async function TemplatesPage() {
  const templates = await getAdminTemplates()

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
          Templates
        </h1>
        <Link
          href="/admin/templates/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          <Plus className="w-4 h-4" />
          New Template
        </Link>
      </div>

      <TemplateList templates={templates} />
    </div>
  )
}
