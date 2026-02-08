"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Plus, FileText, Clock, Trash2, Sparkles, Gift, Check } from "lucide-react"
import type { Project, PageCount, PaperSize } from "@/types/editor"
import { createProject, deleteProject } from "@/lib/editor-actions"
import { validateVoucherCode } from "@/lib/voucher-actions"
import { TemplateBrowser } from "./template-browser"

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

export function getStatusBadgeColors(status: string): string {
  switch (status) {
    case "draft":
      return "bg-yellow-100 text-yellow-800"
    case "processed":
      return "bg-blue-100 text-blue-800"
    case "shipped":
      return "bg-purple-100 text-purple-800"
    case "completed":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function ProjectSelectorModal({ projects }: ProjectSelectorModalProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [projectList, setProjectList] = useState(projects)
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false)

  // Project configuration state
  const [pageCount, setPageCount] = useState<PageCount>(30)
  const [paperSize, setPaperSize] = useState<PaperSize>('A4')
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherApplied, setVoucherApplied] = useState(false)
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Please enter a voucher code")
      return
    }

    setIsValidatingVoucher(true)
    setVoucherError(null)

    try {
      const result = await validateVoucherCode(voucherCode)

      if (result.success && result.voucher) {
        // Auto-populate from voucher
        setPageCount(result.voucher.page_count)
        setPaperSize(result.voucher.paper_size)
        setVoucherApplied(true)
        setVoucherError(null)
      } else {
        setVoucherError(result.error || "Invalid voucher code")
        setVoucherApplied(false)
      }
    } catch (error) {
      console.error("Voucher validation error:", error)
      setVoucherError("Failed to validate voucher")
      setVoucherApplied(false)
    } finally {
      setIsValidatingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setVoucherCode('')
    setVoucherApplied(false)
    setVoucherError(null)
  }

  const handleCreateNew = async () => {
    try {
      setIsCreating(true)
      const project = await createProject({
        title: "Untitled Project",
        page_count: pageCount,
        paper_size: paperSize,
        voucher_code: voucherApplied ? voucherCode : undefined,
      })
      router.push(`/editor/${project.id}`)
    } catch (error) {
      console.error("Failed to create project:", error)
      alert(error instanceof Error ? error.message : "Failed to create project")
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

  // Show template browser
  if (showTemplateBrowser) {
    return (
      <TemplateBrowser
        onBack={() => setShowTemplateBrowser(false)}
        onClose={handleClose}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full relative max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-8 pb-4">
          <h2
            className="text-3xl font-bold text-center"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-neutral)" }}
          >
            Your Projects
          </h2>
          <p className="text-center text-gray-500 mt-2">
            Continue editing a project or start fresh
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex-1 overflow-hidden px-8 pb-8">
          <div className="grid grid-cols-2 gap-8 h-full">
            {/* Left Column: New Project Configuration */}
            <div className="flex flex-col overflow-y-auto pr-4">
              <h3
                className="text-xl font-semibold mb-4"
                style={{ fontFamily: "var(--font-serif)", color: "var(--color-neutral)" }}
              >
                Create New Project
              </h3>

              {/* Project Configuration Section */}
              <div
                className="p-6 rounded-xl border-2 mb-4"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
              >

                {/* Page Count Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Number of Pages
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => !voucherApplied && setPageCount(30)}
                      disabled={voucherApplied}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        pageCount === 30
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-10'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${voucherApplied ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      30 Pages
                    </button>
                    <button
                      onClick={() => !voucherApplied && setPageCount(40)}
                      disabled={voucherApplied}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        pageCount === 40
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-10'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${voucherApplied ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      40 Pages
                    </button>
                  </div>
                </div>

                {/* Paper Size Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Paper Size
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => !voucherApplied && setPaperSize('A4')}
                      disabled={voucherApplied}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        paperSize === 'A4'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-10'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${voucherApplied ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      A4
                    </button>
                    <button
                      onClick={() => !voucherApplied && setPaperSize('A5')}
                      disabled={voucherApplied}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        paperSize === 'A5'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-10'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${voucherApplied ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      A5
                    </button>
                    <button
                      onClick={() => !voucherApplied && setPaperSize('PDF Only')}
                      disabled={voucherApplied}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        paperSize === 'PDF Only'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-10'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${voucherApplied ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      PDF Only
                    </button>
                  </div>
                </div>

                {/* Voucher Section */}
                <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                    <Gift className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
                    Have a voucher? Redeem it here
                  </label>

                  {!voucherApplied ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Enter voucher code"
                        className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        style={{ borderColor: "var(--color-border)" }}
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={isValidatingVoucher || !voucherCode.trim()}
                        className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "var(--color-white)",
                        }}
                      >
                        {isValidatingVoucher ? "Checking..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="flex-1 font-medium text-green-700">
                        Voucher applied: {voucherCode}
                      </span>
                      <button
                        onClick={handleRemoveVoucher}
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {voucherError && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                      {voucherError}
                    </div>
                  )}

                  {voucherApplied && (
                    <p className="mt-2 text-xs text-gray-500">
                      Page count and paper size are set by your voucher
                    </p>
                  )}
                </div>
              </div>

              {/* Create Options */}
              <div className="grid grid-cols-2 gap-4">
                {/* Blank Project Button */}
                <button
                  onClick={handleCreateNew}
                  disabled={isCreating}
                  className="p-4 border-2 rounded-lg font-medium transition-all hover:border-[var(--color-accent)] hover:shadow-md disabled:opacity-50 flex flex-col items-center gap-3"
                  style={{ fontFamily: "var(--font-serif)", borderColor: "var(--color-border)" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-background)" }}
                  >
                    <Plus className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div className="text-center">
                    <span className="block" style={{ color: "var(--color-neutral)" }}>
                      {isCreating ? "Creating..." : "Blank Project"}
                    </span>
                    <span className="text-xs text-gray-500">Start from scratch</span>
                  </div>
                </button>

                {/* Use Template Button */}
                <button
                  onClick={() => setShowTemplateBrowser(true)}
                  className="p-4 border-2 rounded-lg font-medium transition-all hover:border-[var(--color-accent)] hover:shadow-md flex flex-col items-center gap-3"
                  style={{ fontFamily: "var(--font-serif)", borderColor: "var(--color-border)" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-background)" }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div className="text-center">
                    <span className="block" style={{ color: "var(--color-neutral)" }}>
                      Use Template
                    </span>
                    <span className="text-xs text-gray-500">Pre-designed layouts</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Column: Draft Projects */}
            <div className="flex flex-col border-l pl-4" style={{ borderColor: "var(--color-border)" }}>
              <h3
                className="text-xl font-semibold mb-4"
                style={{ fontFamily: "var(--font-serif)", color: "var(--color-neutral)" }}
              >
                Your Projects
              </h3>

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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeColors(project.status)}`}>
                            {project.status}
                          </span>
                        </div>

                        {/* Delete Button - Only show for draft projects */}
                        {project.status === "draft" && (
                          <button
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            disabled={deletingId === project.id}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No projects yet</p>
                  <p className="text-sm mt-1">Create your first photobook project</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
