"use client"

import { useState } from "react"
import { Trash2, Filter } from "lucide-react"
import type { Voucher } from "@/types/voucher"
import { deleteVoucher } from "@/lib/admin-actions"

interface VoucherListProps {
  initialVouchers: Voucher[]
}

const STATUS_COLORS = {
  not_redeemed: "bg-green-100 text-green-800",
  being_redeemed: "bg-yellow-100 text-yellow-800",
  fully_redeemed: "bg-gray-100 text-gray-800",
}

const STATUS_LABELS = {
  not_redeemed: "Available",
  being_redeemed: "In Use",
  fully_redeemed: "Used",
}

export function VoucherList({ initialVouchers }: VoucherListProps) {
  const [vouchers, setVouchers] = useState(initialVouchers)
  const [filter, setFilter] = useState<string>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredVouchers = vouchers.filter((v) =>
    filter === "all" ? true : v.status === filter
  )

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete voucher "${code}"?`)) {
      return
    }

    try {
      setDeletingId(id)
      await deleteVoucher(id)
      setVouchers(vouchers.filter((v) => v.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete voucher")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Filter */}
      <div className="mb-6 flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="not_redeemed">Available</option>
          <option value="being_redeemed">In Use</option>
          <option value="fully_redeemed">Used</option>
        </select>
        <span className="text-sm text-gray-600">
          Showing {filteredVouchers.length} of {vouchers.length} vouchers
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Redeemed At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No vouchers found
                </td>
              </tr>
            ) : (
              filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-medium text-gray-900">
                      {voucher.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {voucher.page_count || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {voucher.paper_size || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        STATUS_COLORS[voucher.status]
                      }`}
                    >
                      {STATUS_LABELS[voucher.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {voucher.project_id ? (
                      <span className="font-mono text-xs">
                        {voucher.project_id.substring(0, 8)}...
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {voucher.redeemed_at
                      ? new Date(voucher.redeemed_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {voucher.status === "not_redeemed" && (
                      <button
                        onClick={() => handleDelete(voucher.id, voucher.code)}
                        disabled={deletingId === voucher.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete voucher"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    )}
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
