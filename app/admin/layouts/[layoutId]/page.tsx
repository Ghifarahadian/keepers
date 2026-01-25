import { notFound } from "next/navigation"
import { getAdminLayout } from "@/lib/admin-actions"
import { LayoutForm } from "@/components/admin/layouts/layout-form"

interface EditLayoutPageProps {
  params: Promise<{ layoutId: string }>
}

export default async function EditLayoutPage({ params }: EditLayoutPageProps) {
  const { layoutId } = await params
  const layout = await getAdminLayout(layoutId)

  if (!layout) {
    notFound()
  }

  return <LayoutForm layout={layout} isEdit />
}
