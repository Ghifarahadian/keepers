import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getAdminProfile, getVouchers } from "@/lib/admin-actions"
import { VoucherList } from "@/components/admin/vouchers/voucher-list"

export default async function VouchersPage() {
  // Check admin access
  const admin = await getAdminProfile()
  if (!admin) {
    redirect("/")
  }

  // Fetch all vouchers
  const vouchers = await getVouchers()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Voucher Management
          </h1>
          <p className="text-gray-600">
            Create and manage voucher codes for photobook orders
          </p>
        </div>
        <Link
          href="/admin/vouchers/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Voucher
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Available</div>
          <div className="text-3xl font-bold text-green-600">
            {vouchers.filter((v) => v.status === "not_redeemed").length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">In Use</div>
          <div className="text-3xl font-bold text-yellow-600">
            {vouchers.filter((v) => v.status === "being_redeemed").length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Used</div>
          <div className="text-3xl font-bold text-gray-600">
            {vouchers.filter((v) => v.status === "fully_redeemed").length}
          </div>
        </div>
      </div>

      {/* Voucher List */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <VoucherList initialVouchers={vouchers} />
      </div>
    </div>
  )
}
