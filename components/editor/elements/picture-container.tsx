"use client"

import { useDroppable } from "@dnd-kit/core"
import type { Element } from "@/types/editor"
import { useEditor } from "@/lib/contexts/editor-context"
import { useCallback } from "react"
import { Trash2, Image, ImageOff } from "lucide-react"
import { BaseElementContainer } from "./base-element-container"

interface PictureContainerProps {
  element: Element
  zoneId: string
}

export function PictureContainer({ element, zoneId }: PictureContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `picture-${element.id}`,
    data: { type: "picture-container", element }
  })

  const { state, deleteElementFromCanvas, updateElementPosition } = useEditor()

  const isSelected = state.selectedElementId === element.id
  const hasPhoto = !!element.photo_url || !!element.photo_storage_path

  // Get the current photo URL from uploaded photos or element
  const photo = state.uploadedPhotos.find(p => p.path === element.photo_storage_path)
  const photoUrl = photo?.url || element.photo_url || ""

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Delete this picture container?")) {
      await deleteElementFromCanvas(element.id)
    }
  }, [element.id, deleteElementFromCanvas])

  const handleRemovePhoto = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    await updateElementPosition(element.id, {
      photo_url: null,
      photo_storage_path: null,
    })
  }, [element.id, updateElementPosition])

  const borderColor = isSelected ? 'rgba(212, 120, 108, 1)'
    : isOver ? 'rgba(212, 120, 108, 0.8)'
    : hasPhoto ? 'rgba(212, 120, 108, 0.3)'
    : 'rgba(0, 0, 0, 0.15)'

  const bgColor = isOver ? 'rgba(212, 120, 108, 0.1)'
    : hasPhoto ? 'transparent'
    : 'rgba(212, 120, 108, 0.05)'

  return (
    <BaseElementContainer
      element={element}
      zoneId={zoneId}
      toolbarActions={[
        ...(hasPhoto ? [{
          icon: <ImageOff size={16} />,
          onClick: handleRemovePhoto,
          title: "Remove photo",
        }] : []),
        {
          icon: <Trash2 size={16} />,
          onClick: handleDelete,
          title: "Delete picture container",
          variant: "danger" as const
        }
      ]}
      borderColor={borderColor}
      backgroundColor={bgColor}
      externalRef={setNodeRef}
    >
      {/* Empty state placeholder */}
      {!hasPhoto && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Image className="w-8 h-8 mb-2" style={{ color: 'var(--color-secondary)' }} />
          <p
            className="text-sm font-medium text-center px-2"
            style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}
          >
            Drag photo here
          </p>
        </div>
      )}

      {/* Photo */}
      {hasPhoto && photoUrl && (
        <div className="absolute inset-0">
          <img
            src={photoUrl}
            alt="Photo"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      )}
    </BaseElementContainer>
  )
}
