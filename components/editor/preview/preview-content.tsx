"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Book, Gift, User, Mail, MapPin, Phone, FileText, Ruler, Check } from "lucide-react"
import type { Project } from "@/types/editor"
import type { UserProfile } from "@/types/auth"
import { redeemVoucher, applyVoucherToProject, revertVoucher } from "@/lib/voucher-actions"
import { updateProject } from "@/lib/editor-actions"
import { SuccessModal } from "./success-modal"

interface PreviewContentProps {
  project: Project
  user: UserProfile
}

export function PreviewContent({ project, user }: PreviewContentProps) {
  const router = useRouter()
  const [voucherCode, setVoucherCode] = useState(project.voucher_code || "")
  const [voucherApplied, setVoucherApplied] = useState(!!project.voucher_code)
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Please enter a voucher code")
      return
    }

    setIsValidatingVoucher(true)
    setVoucherError(null)

    try {
      const result = await applyVoucherToProject(voucherCode, project.id)

      if (result.success) {
        // Update project with voucher code
        await updateProject(project.id, { voucher_code: voucherCode })

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

  const handleRemoveVoucher = async () => {
    if (!voucherCode) return

    try {
      // Revert voucher back to not_redeemed
      await revertVoucher(voucherCode)

      // Clear voucher from project
      await updateProject(project.id, { voucher_code: null })

      // Reset local state
      setVoucherCode('')
      setVoucherApplied(false)
      setVoucherError(null)
    } catch (error) {
      console.error("Failed to remove voucher:", error)
      setVoucherError("Failed to remove voucher")
    }
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsRedeeming(true)

    try {
      const result = await redeemVoucher(voucherCode, project.id)

      if (result.success) {
        setShowSuccessModal(true)
      } else {
        setError(result.error || "Failed to redeem voucher")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsRedeeming(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    router.push("/")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 h-14 border-b flex items-center px-6 z-50"
        style={{
          backgroundColor: "var(--color-white)",
          borderColor: "var(--color-border)",
        }}
      >
        <button
          onClick={() => router.push(`/editor/${project.id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Editor</span>
        </button>
        <h1
          className="flex-1 text-center font-semibold text-lg"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-neutral)",
          }}
        >
          {project.title}
        </h1>
        <div className="w-[120px]" /> {/* Spacer for centering */}
      </header>

      {/* Main content - centered layout */}
      <main className="pt-14 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid grid-cols-[400px_1fr] gap-6">
          {/* Left - Preview placeholder */}
          <div className="flex items-start justify-center pt-8">
            <div
              className="w-full aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center shadow-sm"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-white)",
              }}
            >
              <Book className="w-20 h-20 mb-4 text-gray-300" />
              <h3
                className="text-lg font-medium text-gray-500 mb-1"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {project.title}
              </h3>
              <p className="text-gray-400 text-sm">{project.pages?.length || 0} pages</p>
              <p className="text-gray-400 text-xs mt-3">Preview coming soon</p>
            </div>
          </div>

          {/* Right - Order info in compact cards */}
          <div className="space-y-4 pt-8">
            {/* User Information Section - Compact */}
            <div
              className="p-5 rounded-xl shadow-sm border"
              style={{ backgroundColor: "var(--color-white)", borderColor: "var(--color-border)" }}
            >
              <h2
                className="text-base font-bold mb-3 flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-neutral)",
                }}
              >
                <User className="w-4 h-4" />
                Delivery Information
              </h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-gray-900">{user.address || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-start gap-2 flex-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Postal Code</p>
                      <p className="text-gray-900">{user.postalCode || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 flex-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-900">{user.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/profile")}
                  className="text-xs underline pt-1"
                  style={{ color: "var(--color-accent)" }}
                >
                  Update information
                </button>
              </div>
            </div>

            {/* Order Details Section - Compact */}
            <div
              className="p-5 rounded-xl shadow-sm border"
              style={{ backgroundColor: "var(--color-white)", borderColor: "var(--color-border)" }}
            >
              <h2
                className="text-base font-bold mb-3 flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-neutral)",
                }}
              >
                <Book className="w-4 h-4" />
                Order Details
              </h2>

              <div className="space-y-3">
                {/* Product specs */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Pages</p>
                      <p className="font-semibold text-gray-900">
                        {project.page_count || 30}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <Ruler className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Size</p>
                      <p className="font-semibold text-gray-900">
                        {project.paper_size || 'A4'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Voucher Code Section */}
                <div className="pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <label className="block text-xs font-semibold mb-2 text-gray-700 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
                    Voucher Code
                  </label>

                  {!voucherApplied ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                          style={{ borderColor: "var(--color-border)" }}
                        />
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isValidatingVoucher || !voucherCode.trim()}
                          className="px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: "var(--color-accent)",
                            color: "var(--color-white)",
                          }}
                        >
                          {isValidatingVoucher ? "..." : "Apply"}
                        </button>
                      </div>

                      {voucherError && (
                        <div className="p-2 bg-red-50 border border-red-300 text-red-700 rounded text-xs">
                          {voucherError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-400 rounded-lg">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="flex-1 text-sm font-semibold text-green-700">
                        {voucherCode}
                      </span>
                      <button
                        onClick={handleRemoveVoucher}
                        className="text-xs text-gray-600 hover:text-gray-900 underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Confirmation Button */}
            <form onSubmit={handleRedeem} className="space-y-3">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!voucherApplied || isRedeeming}
                className="w-full py-3 rounded-lg font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-white)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                {isRedeeming ? "Processing..." : "Confirm Order"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        userName={user.firstName}
      />
    </div>
  )
}
