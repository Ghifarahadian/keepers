"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { createVoucher } from "@/lib/admin-actions"
import type { PageCount, PaperSize } from "@/types/editor"

export function VoucherForm() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [pageCount, setPageCount] = useState<PageCount>(30)
  const [paperSize, setPaperSize] = useState<PaperSize>('A4')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCode(result)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!code.trim()) {
      setError("Voucher code is required")
      return
    }

    try {
      setIsSubmitting(true)
      await createVoucher({
        code: code.trim(),
        page_count: pageCount,
        paper_size: paperSize,
      })
      router.push("/admin/vouchers")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create voucher")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Voucher Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voucher Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter voucher code"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={generateRandomCode}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Code will be automatically converted to uppercase
        </p>
      </div>

      {/* Page Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Pages
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPageCount(30)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              pageCount === 30
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            30 Pages
          </button>
          <button
            type="button"
            onClick={() => setPageCount(40)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              pageCount === 40
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            40 Pages
          </button>
        </div>
      </div>

      {/* Paper Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paper Size
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setPaperSize('A4')}
            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              paperSize === 'A4'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            A4
          </button>
          <button
            type="button"
            onClick={() => setPaperSize('A5')}
            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              paperSize === 'A5'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            A5
          </button>
          <button
            type="button"
            onClick={() => setPaperSize('PDF Only')}
            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              paperSize === 'PDF Only'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            PDF Only
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Voucher"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/vouchers")}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
