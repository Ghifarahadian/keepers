import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getAdminProfile } from "@/lib/admin-actions"
import { VoucherForm } from "@/components/admin/vouchers/voucher-form"

export default async function NewVoucherPage() {
  // Check admin access
  const admin = await getAdminProfile()
  if (!admin) {
    redirect("/")
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/vouchers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vouchers
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Voucher
        </h1>
        <p className="text-gray-600">
          Generate a new voucher code for photobook orders
        </p>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <VoucherForm />
      </div>
    </div>
  )
}
