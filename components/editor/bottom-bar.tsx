"use client"

import { Undo, Redo } from "lucide-react"

export function EditorBottomBar() {
  // Undo/Redo functionality will be implemented later
  const canUndo = false
  const canRedo = false

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-14 border-t flex items-center px-6 z-50" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-border)' }}>
      {/* Undo/Redo */}
      <div className="flex items-center gap-2">
        <button
          disabled={!canUndo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            color: 'var(--color-neutral)',
            fontFamily: 'var(--font-serif)'
          }}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
          <span className="text-sm font-medium">Undo</span>
        </button>

        <button
          disabled={!canRedo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            color: 'var(--color-neutral)',
            fontFamily: 'var(--font-serif)'
          }}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
          <span className="text-sm font-medium">Redo</span>
        </button>
      </div>
    </footer>
  )
}
