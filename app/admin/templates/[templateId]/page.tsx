import { notFound } from "next/navigation"
import { getAdminTemplate } from "@/lib/admin-actions"
import { TemplateForm } from "@/components/admin/templates/template-form"

interface EditTemplatePageProps {
  params: Promise<{ templateId: string }>
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { templateId } = await params
  const template = await getAdminTemplate(templateId)

  if (!template) {
    notFound()
  }

  return <TemplateForm template={template} isEdit />
}
