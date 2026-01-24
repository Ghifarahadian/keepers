import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/auth-actions"
import { getUserProjects } from "@/lib/editor-actions"
import { ProjectSelectorModal } from "@/components/editor/modals/project-selector"

export default async function NewEditorPage() {
  // Check authentication
  const user = await getUserProfile()

  if (!user) {
    // Redirect to home with auth modal trigger
    redirect("/?auth=login")
  }

  // Fetch user's existing projects
  const projects = await getUserProjects()

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <ProjectSelectorModal projects={projects} />
    </div>
  )
}
