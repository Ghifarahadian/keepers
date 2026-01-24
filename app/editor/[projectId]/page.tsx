import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/auth-actions"
import { getProject } from "@/lib/editor-actions"
import { loadProjectPhotos } from "@/lib/load-project-photos"
import { EditorLayout } from "@/components/editor/layout"

interface EditorPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  // Check authentication
  const user = await getUserProfile()

  if (!user) {
    // Redirect to home with auth modal trigger
    redirect("/?auth=login")
  }

  // Await params
  const { projectId } = await params

  // Load project data
  const project = await getProject(projectId)

  if (!project) {
    // Project not found or user doesn't have access
    redirect("/editor/new")
  }

  // Load all photos used in this project and regenerate signed URLs
  const uploadedPhotos = await loadProjectPhotos(project)

  return (
    <EditorLayout
      initialProject={project}
      initialUploadedPhotos={uploadedPhotos}
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email ?? '',
      }}
    />
  )
}
