"use client"

import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core"
import { EditorProvider, useEditor } from "@/lib/contexts/editor-context"
import { EditorTopBar } from "./top-bar"
import { EditorPagebar } from "./pagebar"
import { EditorCanvas } from "./canvas"
import { EditorToolbar } from "./toolbar"
import { EditorBottomBar } from "./bottom-bar"
import type { Project, UploadedPhoto } from "@/types/editor"
import { useState } from "react"
import { Image, Type } from "lucide-react"
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
  | { type: "new-element"; elementType: "picture" | "text" }
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
    } else if (data?.type === "new-element") {
      setActiveDragItem({ type: "new-element", elementType: data.elementType })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over } = event
    const dragData = activeDragItem
    setActiveDragItem(null)

    if (!over || !dragData) return

    const dropTarget = over.data.current
    const isCanvasDrop = over.id === "canvas"
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
            elementId: element.id,
            updates: {
              photo_url: photo.url,
              photo_storage_path: photo.path,
            }
          }
        })
        return
      }
    }

    // Handle new element creation (from elements panel)
    if (dragData.type === "new-element" && isCanvasDrop) {
      const elementType = dragData.elementType

      // Create element at center of canvas with default size
      addElementToCanvas(state.currentPageId, {
        type: elementType === "picture" ? "photo" : "text",
        page_id: state.currentPageId,
        position_x: 25,
        position_y: 25,
        width: 50,
        height: 50,
        rotation: 0,
        z_index: state.elements[state.currentPageId]?.length || 0,
      })
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
        {activeDragItem?.type === "new-element" && activeDragItem.elementType === "picture" && (
          <div className="w-24 h-24 rounded-lg shadow-2xl overflow-hidden border-2 opacity-80 flex items-center justify-center" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-accent)' }}>
            <Image className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
          </div>
        )}
        {activeDragItem?.type === "new-element" && activeDragItem.elementType === "text" && (
          <div className="w-24 h-24 rounded-lg shadow-2xl overflow-hidden border-2 opacity-80 flex items-center justify-center" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-accent)' }}>
            <Type className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
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
