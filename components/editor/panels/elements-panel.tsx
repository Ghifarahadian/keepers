"use client"

import { useEffect, useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { Image, Type } from "lucide-react"

type ElementType = "picture" | "text"

interface DraggableElementProps {
  type: ElementType
  label: string
  icon: React.ReactNode
}

function DraggableElement({ type, label, icon }: DraggableElementProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: { type: "new-element", elementType: type },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const style = isDragging ? { opacity: 0.5 } : undefined

  // Only apply dnd-kit attributes after client-side mount to avoid hydration mismatch
  const dndProps = isMounted ? { ...listeners, ...attributes } : {}

  return (
    <div
      ref={setNodeRef}
      {...dndProps}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 group"
      style={{ ...style, borderColor: 'var(--color-border)' }}
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors group-hover:bg-[var(--color-accent)]/10" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
        {icon}
      </div>
      <span className="text-sm font-medium" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
        {label}
      </span>
      <span className="text-xs" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
        Drag to canvas
      </span>
    </div>
  )
}

export function ElementsPanel() {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
        Add Elements
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <DraggableElement
          type="picture"
          label="Picture"
          icon={<Image className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />}
        />
        <DraggableElement
          type="text"
          label="Text"
          icon={<Type className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />}
        />
      </div>

      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
        <p className="text-xs" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
          <strong>Tip:</strong> Drag elements onto the canvas to create containers.
          You can resize and reposition them after placing.
        </p>
      </div>
    </div>
  )
}
