"use server"

import { createClient } from "@/lib/supabase/server"
import type { UploadedPhoto, Project } from "@/types/editor"

/**
 * Load ALL photos from a project's storage folder and regenerate signed URLs.
 * This includes both photos already placed in elements AND photos that are uploaded but not yet placed.
 */
export async function loadProjectPhotos(project: Project): Promise<UploadedPhoto[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // List ALL photos in the project's storage folder
  const folderPath = `${user.id}/${project.id}`

  const { data: files, error: listError } = await supabase.storage
    .from("project-photos")
    .list(folderPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    })

  if (listError) {
    console.error("Failed to list photos:", listError)
    return []
  }

  if (!files || files.length === 0) {
    return []
  }

  // Generate signed URLs for all photos in storage
  const photos = await Promise.all(
    files.map(async (file): Promise<UploadedPhoto | null> => {
      const fullPath = `${folderPath}/${file.name}`

      const { data: signedData, error } = await supabase.storage
        .from("project-photos")
        .createSignedUrl(fullPath, 60 * 60 * 24 * 365) // 1 year

      if (error) {
        console.error(`Failed to create signed URL for ${fullPath}:`, error)
        return null
      }

      // Extract original filename (remove timestamp prefix if present)
      const filename = file.name

      return {
        id: crypto.randomUUID(),
        url: signedData.signedUrl,
        path: fullPath,
        filename: filename,
        uploaded_at: new Date(file.created_at).toISOString(),
      }
    })
  )

  // Filter out any failed URLs
  return photos.filter((photo): photo is UploadedPhoto => photo !== null)
}
