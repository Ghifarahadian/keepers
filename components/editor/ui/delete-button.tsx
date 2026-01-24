"use client"

import { Loader2, Trash2 } from "lucide-react"

interface DeleteButtonProps {
  onClick: (e: React.MouseEvent) => void
  isDeleting?: boolean
  className?: string
}

export function DeleteButton({ onClick, isDeleting = false, className = "" }: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDeleting}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${className}`}
      style={{
        backgroundColor: "var(--color-accent)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent)")}
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 text-white" />
      )}
    </button>
  )
}
