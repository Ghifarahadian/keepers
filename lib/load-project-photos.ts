"use server"

import { createClient } from "@/lib/supabase/server"
import type { UploadedPhoto, Project } from "@/types/editor"

/**
 * Extract all unique photos from a project and regenerate signed URLs
 */
export async function loadProjectPhotos(project: Project): Promise<UploadedPhoto[]> {
  const supabase = await createClient()

  // Collect all unique photo paths from elements
  const photoPathsSet = new Set<string>()

  project.pages?.forEach(page => {
    page.elements?.forEach(element => {
      if (element.type === 'photo' && element.photo_storage_path) {
        photoPathsSet.add(element.photo_storage_path)
      }
    })
  })

  const photoPaths = Array.from(photoPathsSet)

  // Generate signed URLs for all photos
  const photos = await Promise.all(
    photoPaths.map(async (path): Promise<UploadedPhoto | null> => {
      const { data: signedData, error } = await supabase.storage
        .from("project-photos")
        .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year

      if (error) {
        console.error(`Failed to create signed URL for ${path}:`, error)
        return null
      }

      // Extract filename from path
      const filename = path.split('/').pop() || path

      return {
        id: crypto.randomUUID(),
        url: signedData.signedUrl,
        path: path,
        filename: filename,
        uploaded_at: new Date().toISOString(),
      }
    })
  )

  // Filter out any failed URLs
  return photos.filter((photo): photo is UploadedPhoto => photo !== null)
}
