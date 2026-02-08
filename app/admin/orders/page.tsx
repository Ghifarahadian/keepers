import { redirect } from "next/navigation"
import { getAdminProfile, getAdminProjects } from "@/lib/admin-actions"
import { OrderList } from "@/components/admin/orders/order-list"

export default async function OrdersPage() {
  // Check admin access
  const admin = await getAdminProfile()
  if (!admin) {
    redirect("/")
  }

  // Fetch all projects with user data
  const projects = await getAdminProjects()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Management
        </h1>
        <p className="text-gray-600">
          View and manage all photobook orders from all users
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Draft</div>
          <div className="text-3xl font-bold text-gray-600">
            {projects.filter((p) => p.status === "draft").length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Processed</div>
          <div className="text-3xl font-bold text-blue-600">
            {projects.filter((p) => p.status === "processed").length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Shipped</div>
          <div className="text-3xl font-bold text-yellow-600">
            {projects.filter((p) => p.status === "shipped").length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-600">
            {projects.filter((p) => p.status === "completed").length}
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <OrderList initialProjects={projects} />
      </div>
    </div>
  )
}
