import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/auth-actions"
import { getProject } from "@/lib/editor-actions"
import { PreviewContent } from "@/components/editor/preview/preview-content"

interface PreviewPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  // Check authentication
  const user = await getUserProfile()

  if (!user) {
    redirect("/?auth=login")
  }

  // Await params
  const { projectId } = await params

  // Load project data
  const project = await getProject(projectId)

  if (!project) {
    redirect("/editor/new")
  }

  return (
    <PreviewContent
      project={project}
      user={user}
    />
  )
}
