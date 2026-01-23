"use client"

import { useState, useRef, useEffect } from "react"
import { useEditor } from "@/lib/contexts/editor-context"
import { Upload, Loader2 } from "lucide-react"
import { uploadPhoto, deletePhoto } from "@/lib/photo-upload-actions"
import { useDraggable } from "@dnd-kit/core"
import type { UploadedPhoto } from "@/types/editor"
import { DeleteButton } from "../delete-button"

function DraggablePhoto({ photo, onDelete }: { photo: UploadedPhoto; onDelete: (photo: UploadedPhoto) => void }) {
  const [imageError, setImageError] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: photo.id,
    data: { type: "photo", photo },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const style = isDragging
    ? { opacity: 0 }
    : undefined

  // Only apply dnd-kit attributes after client-side mount to avoid hydration mismatch
  const dndProps = isMounted ? { ...listeners, ...attributes } : {}

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDeleting(true)
    await onDelete(photo)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dndProps}
      className="relative aspect-square rounded-lg overflow-hidden cursor-grab active:cursor-grabbing group"
    >
      {imageError ? (
        <div className="w-full h-full flex items-center justify-center text-xs p-2" style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error-text)', fontFamily: 'var(--font-serif)' }}>
          Failed to load
        </div>
      ) : (
        <img
          src={photo.url}
          alt={photo.filename}
          className="w-full h-full object-cover"
          draggable={false}
          onError={() => {
            console.error('[DraggablePhoto] Failed to load image:', photo.url)
            setImageError(true)
          }}
          onLoad={() => {
            console.log('[DraggablePhoto] Successfully loaded:', photo.filename, photo.url)
          }}
        />
      )}
      {/* Delete button */}
      <DeleteButton
        onClick={handleDelete}
        isDeleting={isDeleting}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-white)', fontFamily: 'var(--font-serif)' }}>
          Drag to canvas
        </span>
      </div>
    </div>
  )
}

export function PhotosPanel() {
  const { state, addUploadedPhoto, removeUploadedPhoto, deleteElementFromCanvas } = useEditor()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debug: log uploaded photos
  console.log('[PhotosPanel] uploadedPhotos:', state.uploadedPhotos)

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Upload to Supabase Storage
        const result = await uploadPhoto(file, state.project.id)

        // Add to context
        addUploadedPhoto({
          id: crypto.randomUUID(),
          url: result.url,
          path: result.path,
          filename: result.filename,
          uploaded_at: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "Failed to upload photos")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeletePhoto = async (photo: UploadedPhoto) => {
    try {
      // First, find and delete any canvas elements using this photo
      const elementsToDelete: string[] = []
      Object.values(state.elements).forEach((pageElements) => {
        pageElements.forEach((element) => {
          if (element.photo_storage_path === photo.path) {
            elementsToDelete.push(element.id)
          }
        })
      })

      // Delete elements from canvas
      for (const elementId of elementsToDelete) {
        await deleteElementFromCanvas(elementId)
      }

      // Then delete from storage
      await deletePhoto(photo.path)
      removeUploadedPhoto(photo.id)
    } catch (err: any) {
      console.error("Delete error:", err)
      setError(err.message || "Failed to delete photo")
    }
  }

  return (
    <div className="p-4">
      {/* Upload Button */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: 'var(--color-white)', fontFamily: 'var(--font-serif)' }}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Photos
            </>
          )}
        </button>

        {error && (
          <p className="mt-2 text-sm" style={{ color: 'var(--color-error-text)', fontFamily: 'var(--font-serif)' }}>{error}</p>
        )}

        <p className="mt-2 text-xs text-center" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
          Max 10MB per photo • JPG, PNG, WEBP, HEIC
        </p>
      </div>

      {/* Photo Library */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
          Your Photos ({state.uploadedPhotos.length})
        </h3>

        {state.uploadedPhotos.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
            <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No photos yet</p>
            <p className="text-xs mt-1">Upload photos to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {state.uploadedPhotos.map((photo) => (
              <DraggablePhoto key={photo.id} photo={photo} onDelete={handleDeletePhoto} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
