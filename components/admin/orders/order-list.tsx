"use client"

import { useState } from "react"
import { Filter, Search } from "lucide-react"
import type { AdminProject } from "@/types/template"
import { updateProjectStatus } from "@/lib/admin-actions"

interface OrderListProps {
  initialProjects: AdminProject[]
}

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  processed: "bg-blue-100 text-blue-800",
  shipped: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
} as const

export function OrderList({ initialProjects }: OrderListProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projectSearch, setProjectSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Apply filters
  const filteredProjects = projects.filter((p) => {
    // Status filter
    if (statusFilter !== "all" && p.status !== statusFilter) return false

    // Project UUID search (case-insensitive, partial match)
    if (projectSearch && !p.id.toLowerCase().includes(projectSearch.toLowerCase())) {
      return false
    }

    // User UUID search (case-insensitive, partial match)
    if (userSearch && (!p.user_id || !p.user_id.toLowerCase().includes(userSearch.toLowerCase()))) {
      return false
    }

    return true
  })

  const handleStatusChange = async (
    projectId: string,
    newStatus: "draft" | "processed" | "shipped" | "completed"
  ) => {
    try {
      setUpdatingId(projectId)

      // Optimistic update
      setProjects(
        projects.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
      )

      // Server update
      await updateProjectStatus(projectId, newStatus)
    } catch (error) {
      // Revert on error
      setProjects(initialProjects)
      alert(error instanceof Error ? error.message : "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="processed">Processed</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Project UUID Search */}
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Project ID..."
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        {/* User UUID Search */}
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search User ID..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        {/* Result Count */}
        <span className="text-sm text-gray-600">
          Showing {filteredProjects.length} of {projects.length} orders
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voucher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Edited
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  {/* Project ID - Truncated with click-to-copy */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => copyToClipboard(project.id)}
                      className="font-mono text-xs text-blue-600 hover:text-blue-800"
                      title={`Click to copy: ${project.id}`}
                    >
                      {project.id.substring(0, 8)}...
                    </button>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{project.title}</span>
                  </td>

                  {/* Customer Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {project.user ? (
                      <div>
                        <div className="font-medium">
                          {project.user.first_name} {project.user.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{project.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>

                  {/* User ID - Truncated with click-to-copy */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.user_id ? (
                      <button
                        onClick={() => copyToClipboard(project.user_id!)}
                        className="font-mono text-xs text-blue-600 hover:text-blue-800"
                        title={`Click to copy: ${project.user_id}`}
                      >
                        {project.user_id.substring(0, 8)}...
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">No user</span>
                    )}
                  </td>

                  {/* Status - Dropdown */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={project.status}
                      onChange={(e) =>
                        handleStatusChange(
                          project.id,
                          e.target.value as "draft" | "processed" | "shipped" | "completed"
                        )
                      }
                      disabled={updatingId === project.id}
                      className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        STATUS_COLORS[project.status]
                      } ${
                        updatingId === project.id
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="processed">Processed</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>

                  {/* Page Count */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {project.page_count || "-"}
                  </td>

                  {/* Paper Size */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {project.paper_size || "-"}
                  </td>

                  {/* Voucher Code */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {project.voucher_code ? (
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {project.voucher_code}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Last Edited */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(project.last_edited_at).toLocaleDateString()}
                  </td>

                  {/* Actions - Placeholder for future expansion */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {/* Future: View Details, Download, etc. */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
