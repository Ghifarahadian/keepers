"use client"

import { useEffect } from "react"
import { CheckCircle } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
}

export function SuccessModal({ isOpen, onClose, userName }: SuccessModalProps) {
  // Auto-redirect after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 text-center shadow-xl">
        <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />

        <h2
          className="text-2xl font-bold mb-4"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-neutral)",
          }}
        >
          Thank You{userName ? `, ${userName}` : ""}!
        </h2>

        <p className="text-gray-700 mb-6 text-lg">
          Thank you for your purchase. Your product is on the way!
        </p>

        <p className="text-gray-500 text-sm mb-6">
          You will be redirected to the home page shortly...
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "var(--color-white)",
            fontFamily: "var(--font-serif)",
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  )
}
