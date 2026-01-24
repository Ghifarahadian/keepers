"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { Element } from "@/types/editor"

interface PhotoElementProps {
  element: Element
}

/**
 * PhotoElement is a pure display component.
 * Photos fill 100% of their zone container.
 * All interactions are handled by ZoneContainer.
 */
export function PhotoElement({ element }: PhotoElementProps) {
  const { state } = useEditor()

  // Get fresh signed URL from uploadedPhotos if available
  const photo = state.uploadedPhotos.find(p => p.path === element.photo_storage_path)
  const photoUrl = photo?.url || element.photo_url || ""

  return (
    <div className="absolute inset-0">
      <img
        src={photoUrl}
        alt="Photo"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  )
}
