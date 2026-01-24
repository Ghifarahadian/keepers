"use client"

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core"
import { EditorProvider, useEditor } from "@/lib/contexts/editor-context"
import { EditorTopBar } from "./top-bar"
import { EditorSidebar } from "./sidebar"
import { EditorCanvas } from "./canvas"
import { EditorToolbar } from "./toolbar"
import { EditorBottomBar } from "./bottom-bar"
import type { Project, UploadedPhoto } from "@/types/editor"
import { deleteElement } from "@/lib/editor-actions"
import { useState } from "react"

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

function EditorContent() {
  const { state, addElementToCanvas, dispatch } = useEditor()
  const [activePhoto, setActivePhoto] = useState<UploadedPhoto | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: any) => {
    const { active } = event
    if (active.data.current?.type === "photo") {
      setActivePhoto(active.data.current.photo)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActivePhoto(null)

    if (!over) return

    const photo = active.data.current?.photo as UploadedPhoto
    if (!photo) return

    const dropTarget = over.data.current
    const isZoneDrop = dropTarget?.type === "zone"
    const zoneIndex = isZoneDrop ? dropTarget.zone.zone_index : 0

    // If zone is occupied, delete existing element first
    if (isZoneDrop) {
      const existingElement = state.elements[state.currentPageId]?.find(
        el => el.zone_index === zoneIndex
      )
      if (existingElement) {
        await deleteElement(existingElement.id)
        dispatch({ type: "DELETE_ELEMENT", payload: { elementId: existingElement.id } })
      }
    }

    // Add element - always fills zone at 0,0,100,100
    addElementToCanvas(state.currentPageId, {
      type: "photo",
      page_id: state.currentPageId,
      photo_url: photo.url,
      photo_storage_path: photo.path,
      position_x: 0,
      position_y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      z_index: state.elements[state.currentPageId]?.length || 0,
      zone_index: zoneIndex,
    })
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
        <EditorTopBar />
        <div className="pt-16 pb-14">
          <EditorSidebar />
          <main className="ml-60 mr-80">
            <EditorCanvas />
          </main>
          <EditorToolbar />
        </div>
        <EditorBottomBar />
      </div>

      <DragOverlay>
        {activePhoto && (
          <div className="w-24 h-24 rounded-lg shadow-2xl overflow-hidden border-2 opacity-80" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-accent)' }}>
            <img src={activePhoto.url} alt="Dragging" className="w-full h-full object-cover" />
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
