"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Plus, FileText, Clock, Trash2 } from "lucide-react"
import type { Project } from "@/types/editor"
import { createProject, deleteProject } from "@/lib/editor-actions"

interface ProjectSelectorModalProps {
  projects: Project[]
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

export function ProjectSelectorModal({ projects }: ProjectSelectorModalProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [projectList, setProjectList] = useState(projects)

  const handleCreateNew = async () => {
    try {
      setIsCreating(true)
      const project = await createProject({ title: "Untitled Project" })
      router.push(`/editor/${project.id}`)
    } catch (error) {
      console.error("Failed to create project:", error)
      setIsCreating(false)
    }
  }

  const handleSelectProject = (projectId: string) => {
    router.push(`/editor/${projectId}`)
  }

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation() // Prevent triggering the select action

    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      return
    }

    try {
      setDeletingId(projectId)
      await deleteProject(projectId)
      setProjectList(projectList.filter(p => p.id !== projectId))
    } catch (error) {
      console.error("Failed to delete project:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8 relative max-h-[80vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2
            className="text-3xl font-bold text-center"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-neutral)" }}
          >
            Your Projects
          </h2>
          <p className="text-center text-gray-500 mt-2">
            Continue editing a draft or start fresh
          </p>
        </div>

        {/* Create New Project Button */}
        <button
          onClick={handleCreateNew}
          disabled={isCreating}
          className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          <Plus className="w-5 h-5" />
          {isCreating ? "Creating..." : "Create New Project"}
        </button>

        {/* Divider */}
        {projectList.length > 0 && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Your Drafts</span>
            </div>
          </div>
        )}

        {/* Projects List */}
        {projectList.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {projectList.map((project) => (
              <div
                key={project.id}
                onClick={() => handleSelectProject(project.id)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-[var(--color-accent)] hover:bg-gray-50 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Project Icon/Thumbnail */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium text-gray-900 truncate"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Edited {formatRelativeTime(project.last_edited_at)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                      {project.status}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    disabled={deletingId === project.id}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No projects yet</p>
            <p className="text-sm mt-1">Create your first photobook project above</p>
          </div>
        )}
      </div>
    </div>
  )
}
