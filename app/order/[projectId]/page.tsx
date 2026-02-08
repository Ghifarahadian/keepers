import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/auth-actions"
import { getProject } from "@/lib/editor-actions"
import { OrderContent } from "@/components/editor/order/order-content"

interface OrderPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function OrderPage({ params }: OrderPageProps) {
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

  // Verify user owns this project
  if (project.user_id !== user.id) {
    redirect("/editor/new")
  }

  return (
    <OrderContent
      project={project}
      userProfile={user}
    />
  )
}
