"use client"

import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay, pointerWithin } from "@dnd-kit/core"
import { EditorProvider, useEditor } from "@/lib/contexts/editor-context"
import { EditorTopBar } from "./top-bar"
import { EditorPagebar } from "./pagebar"
import { EditorCanvas } from "./canvas"
import { EditorToolbar } from "./toolbar"
import { EditorBottomBar } from "./bottom-bar"
import type { Project, UploadedPhoto } from "@/types/editor"
import { useState } from "react"
import { updateElement } from "@/lib/editor-actions"

interface EditorLayoutProps {
  initialProject: Project
  initialUploadedPhotos?: UploadedPhoto[]
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

type DragItem =
  | { type: "photo"; photo: UploadedPhoto }
  | null

function EditorContent() {
  const { state, addElementToCanvas, dispatch } = useEditor()
  const [activeDragItem, setActiveDragItem] = useState<DragItem>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current

    if (data?.type === "photo") {
      setActiveDragItem({ type: "photo", photo: data.photo })
    }
  }

  const upsertPhotoInZone = async (zoneId: string, photo: UploadedPhoto) => {
    const existingElements = state.elements[zoneId] || []
    if (existingElements.length > 0) {
      const existingElement = existingElements[0]
      await updateElement(existingElement.id, {
        photo_url: photo.url,
        photo_storage_path: photo.path,
      })
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          zoneId,
          elementId: existingElement.id,
          updates: { photo_url: photo.url, photo_storage_path: photo.path },
        },
      })
    } else {
      await addElementToCanvas(zoneId, {
        type: "photo",
        zone_id: zoneId,
        photo_url: photo.url,
        photo_storage_path: photo.path,
        position_x: 50,
        position_y: 50,
        width: 100,
        height: 100,
        rotation: 0,
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over } = event
    const dragData = activeDragItem
    setActiveDragItem(null)

    if (!over || !dragData) return

    const dropTarget = over.data.current
    const isPictureContainerDrop = dropTarget?.type === "picture-container"

    // Handle photo drops (from sidebar photos panel)
    if (dragData.type === "photo") {
      const photo = dragData.photo

      // Dropping on a picture container - fill it with the photo
      if (isPictureContainerDrop) {
        const element = dropTarget.element
        // Update the picture container with the photo (both local state and database)
        await updateElement(element.id, {
          photo_url: photo.url,
          photo_storage_path: photo.path,
        })
        dispatch({
          type: "UPDATE_ELEMENT",
          payload: {
            zoneId: element.zone_id,
            elementId: element.id,
            updates: {
              photo_url: photo.url,
              photo_storage_path: photo.path,
            }
          }
        })
        return
      }

      // Dropping on a zone - upsert photo element (1:1 zone-element constraint)
      if (dropTarget?.type === "zone") {
        const zone = dropTarget.zone

        if (!zone) return

        await upsertPhotoInZone(zone.id, photo)
        return
      }

      // Fallback: dropped on canvas (not directly on a zone) — find the first
      // photo zone on that page so full-canvas zones still receive drops.
      if (dropTarget?.pageId) {
        const pageZones = state.zones[dropTarget.pageId] || []
        const firstPhotoZone = pageZones.find(z => z.zone_type === "photo")
        if (firstPhotoZone) {
          await upsertPhotoInZone(firstPhotoZone.id, photo)
        }
        return
      }
    }

  }

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
        <EditorTopBar />
        <div className="pt-16 pb-14">
          <EditorPagebar />
          <main className="ml-60 mr-80">
            <EditorCanvas />
          </main>
          <EditorToolbar />
        </div>
        <EditorBottomBar />
      </div>

      <DragOverlay>
        {activeDragItem?.type === "photo" && (
          <div className="w-24 h-24 rounded-lg shadow-2xl overflow-hidden border-2 opacity-80" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-accent)' }}>
            <img src={activeDragItem.photo.url} alt="Dragging" className="w-full h-full object-cover" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export function EditorLayout({ initialProject, initialUploadedPhotos }: EditorLayoutProps) {
  return (
    <EditorProvider initialProject={initialProject} initialUploadedPhotos={initialUploadedPhotos}>
      <EditorContent />
    </EditorProvider>
  )
}
