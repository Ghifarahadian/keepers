"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Book, Gift, User, Mail, MapPin, Phone, FileText, Ruler, Download, Package } from "lucide-react"
import type { Project } from "@/types/editor"
import type { UserProfile } from "@/types/auth"
import { getStatusBadgeColors } from "@/components/editor/modals/project-selector"

interface OrderContentProps {
  project: Project
  userProfile: UserProfile
}

export function OrderContent({ project, userProfile }: OrderContentProps) {
  const router = useRouter()

  const handleDownloadPDF = () => {
    if (project.status === "draft") {
      return
    }
    // TODO: Implement PDF download functionality
    console.log("Download PDF for project:", project.id)
  }

  const isDraft = project.status === "draft"

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
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
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
            {/* Order Details Section with Status Badge */}
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

              {/* Status Badge */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Status</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize mt-1 ${getStatusBadgeColors(project.status)}`}>
                  {project.status}
                </span>
              </div>

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

                {/* Voucher Code Display (read-only) */}
                {project.voucher_code && (
                  <div className="pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                    <label className="block text-xs font-semibold mb-2 text-gray-700 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
                      Voucher Code
                    </label>
                    <div className="p-2.5 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">
                        {project.voucher_code}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information Section - Read-only */}
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
                      {userProfile.firstName} {userProfile.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900">{userProfile.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-gray-900">{userProfile.address || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-start gap-2 flex-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Postal Code</p>
                      <p className="text-gray-900">{userProfile.postalCode || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 flex-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-900">{userProfile.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDraft}
              className="w-full py-3 rounded-lg font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              style={{
                backgroundColor: isDraft ? "var(--color-border)" : "var(--color-accent)",
                color: "var(--color-white)",
                fontFamily: "var(--font-serif)",
              }}
              title={isDraft ? "Complete your order first" : "Download PDF"}
            >
              <Download className="w-5 h-5" />
              {isDraft ? "Complete your order first" : "Download PDF"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
