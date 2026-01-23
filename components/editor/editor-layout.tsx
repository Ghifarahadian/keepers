"use client"

import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core"
import { EditorProvider, useEditor } from "@/lib/contexts/editor-context"
import { EditorTopBar } from "./editor-top-bar"
import { EditorSidebar } from "./editor-sidebar"
import { EditorCanvas } from "./editor-canvas"
import { EditorToolbar } from "./editor-toolbar"
import { EditorBottomBar } from "./editor-bottom-bar"
import type { Project, UploadedPhoto } from "@/types/editor"
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
  const { state, addElementToCanvas } = useEditor()
  const [activePhoto, setActivePhoto] = useState<UploadedPhoto | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
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

    if (!over || over.id !== "canvas") {
      setActivePhoto(null)
      return
    }

    // Get photo from drag data
    const photo = active.data.current?.photo as UploadedPhoto
    if (!photo) {
      setActivePhoto(null)
      return
    }

    // Load the image to get its natural dimensions
    const img = new Image()
    img.src = photo.url

    img.onload = () => {
      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight
      const aspectRatio = naturalWidth / naturalHeight

      // Canvas aspect ratio is 8.5 / 11 (portrait)
      const canvasAspectRatio = 8.5 / 11

      // Calculate dimensions that preserve aspect ratio
      // Use a max size of 50% of canvas width or height
      const maxSize = 50
      let width: number
      let height: number

      if (aspectRatio > canvasAspectRatio) {
        // Image is wider than canvas ratio - constrain by width
        width = maxSize
        height = (maxSize / aspectRatio) * canvasAspectRatio
      } else {
        // Image is taller than canvas ratio - constrain by height
        height = maxSize
        width = (maxSize * aspectRatio) / canvasAspectRatio
      }

      // Ensure minimum size of 10%
      width = Math.max(width, 10)
      height = Math.max(height, 10)

      // Position randomly but ensure it fits within canvas
      const position_x = Math.random() * (90 - width - 5) + 5
      const position_y = Math.random() * (90 - height - 5) + 5

      // Add element to canvas
      addElementToCanvas(state.currentPageId, {
        type: "photo",
        page_id: state.currentPageId,
        photo_url: photo.url,
        photo_storage_path: photo.path,
        position_x,
        position_y,
        width,
        height,
        rotation: 0,
        z_index: state.elements[state.currentPageId]?.length || 0,
      })
    }

    img.onerror = () => {
      // Fallback to default size if image fails to load
      const defaultWidth = 30
      const defaultHeight = 30
      const position_x = Math.random() * (70 - 10) + 10
      const position_y = Math.random() * (70 - 10) + 10

      addElementToCanvas(state.currentPageId, {
        type: "photo",
        page_id: state.currentPageId,
        photo_url: photo.url,
        photo_storage_path: photo.path,
        position_x,
        position_y,
        width: defaultWidth,
        height: defaultHeight,
        rotation: 0,
        z_index: state.elements[state.currentPageId]?.length || 0,
      })
    }

    setActivePhoto(null)
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

      {/* Drag Overlay */}
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

export function EditorLayout({ initialProject, initialUploadedPhotos, user }: EditorLayoutProps) {
  return (
    <EditorProvider initialProject={initialProject} initialUploadedPhotos={initialUploadedPhotos}>
      <EditorContent />
    </EditorProvider>
  )
}
