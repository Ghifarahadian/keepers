"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEditor } from "@/lib/contexts/editor-context"
import { Save, Eye } from "lucide-react"

export function EditorTopBar() {
  const router = useRouter()
  const { state, updateProjectTitle, saveProject } = useEditor()
  const [title, setTitle] = useState(state.project.title)
  const [isEditing, setIsEditing] = useState(false)

  // Sync with context when project title changes externally
  useEffect(() => {
    setTitle(state.project.title)
  }, [state.project.title])

  const handleTitleSubmit = () => {
    if (title.trim() && title !== state.project.title) {
      updateProjectTitle(title.trim())
    }
    setIsEditing(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit()
    } else if (e.key === "Escape") {
      setTitle(state.project.title)
      setIsEditing(false)
    }
  }

  const handlePreview = () => {
    router.push(`/preview/${state.project.id}`)
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-6 z-50" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-border)' }}>
      {/* Left: Logo */}
      <Link href="/" className="text-2xl font-bold transition-colors" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
        KEEPERS
      </Link>

      {/* Center: Project Title */}
      <div className="absolute left-1/2 -translate-x-1/2">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="text-lg font-medium text-center border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] min-w-[200px]"
            style={{
              color: 'var(--color-neutral)',
              backgroundColor: 'var(--color-white)',
              borderColor: 'var(--color-border)',
              fontFamily: 'var(--font-serif)'
            }}
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-lg font-medium hover:text-[var(--color-accent)] transition-colors px-3 py-1 rounded"
            style={{
              color: 'var(--color-neutral)',
              fontFamily: 'var(--font-serif)'
            }}
          >
            {state.project.title}
          </button>
        )}
      </div>

      {/* Right: Save & Preview Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => saveProject()}
          disabled={state.isSaving}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-serif)'
          }}
        >
          <Save className="w-4 h-4" />
          {state.isSaving ? "Saving..." : "Save Draft"}
        </button>

        <button
          onClick={handlePreview}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-colors"
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-serif)'
          }}
          title="Preview photobook"
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>
      </div>
    </header>
  )
}
