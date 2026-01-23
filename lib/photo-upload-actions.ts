"use server"

import { createClient } from "@/lib/supabase/server"

export interface UploadPhotoResult {
  url: string
  path: string
  filename: string
}

// ============================================
// PHOTO UPLOAD ACTIONS
// ============================================

export async function uploadPhoto(
  file: File,
  projectId: string
): Promise<UploadPhotoResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size exceeds 10MB limit")
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WEBP, and HEIC images are allowed")
  }

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = file.name.split(".").pop()
  const filename = `${timestamp}-${randomString}.${fileExtension}`
  const path = `${user.id}/${projectId}/${filename}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("project-photos")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    console.error("Upload error:", error)
    throw new Error(`Failed to upload photo: ${error.message}`)
  }

  // Get signed URL (valid for 1 year for private buckets)
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from("project-photos")
    .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year

  if (urlError) {
    console.error("Signed URL error:", urlError)
    throw new Error(`Failed to get photo URL: ${urlError.message}`)
  }

  return {
    url: signedUrlData.signedUrl,
    path: path,
    filename: file.name,
  }
}

export async function uploadMultiplePhotos(
  files: File[],
  projectId: string
): Promise<UploadPhotoResult[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Validate total number of files (max 50 per upload)
  if (files.length > 50) {
    throw new Error("Cannot upload more than 50 photos at once")
  }

  // Upload all files in parallel
  const uploadPromises = files.map((file) => uploadPhoto(file, projectId))

  try {
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error("Batch upload error:", error)
    throw error
  }
}

export async function deletePhoto(path: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify the path belongs to the user
  if (!path.startsWith(`${user.id}/`)) {
    throw new Error("Unauthorized: Cannot delete photo from another user")
  }

  const { error } = await supabase.storage.from("project-photos").remove([path])

  if (error) {
    console.error("Delete error:", error)
    throw new Error(`Failed to delete photo: ${error.message}`)
  }
}

export async function deleteMultiplePhotos(paths: string[]): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify all paths belong to the user
  const invalidPaths = paths.filter((path) => !path.startsWith(`${user.id}/`))
  if (invalidPaths.length > 0) {
    throw new Error("Unauthorized: Cannot delete photos from another user")
  }

  const { error } = await supabase.storage.from("project-photos").remove(paths)

  if (error) {
    console.error("Batch delete error:", error)
    throw new Error(`Failed to delete photos: ${error.message}`)
  }
}

// Helper function to get photo URL from storage path
export async function getPhotoUrl(path: string): Promise<string> {
  const supabase = await createClient()

  // Use signed URL for private buckets
  const { data, error } = await supabase.storage
    .from("project-photos")
    .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year

  if (error) {
    console.error("Signed URL error:", error)
    throw new Error(`Failed to get photo URL: ${error.message}`)
  }

  return data.signedUrl
}

// Helper function to list all photos for a project
export async function listProjectPhotos(
  projectId: string
): Promise<Array<{ name: string; path: string; url: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const folderPath = `${user.id}/${projectId}`

  const { data, error } = await supabase.storage
    .from("project-photos")
    .list(folderPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    })

  if (error) {
    console.error("List error:", error)
    throw new Error(`Failed to list photos: ${error.message}`)
  }

  // Map to include full path and URL with signed URLs
  const photosWithUrls = await Promise.all(
    data.map(async (file) => {
      const fullPath = `${folderPath}/${file.name}`
      const { data: signedData } = await supabase.storage
        .from("project-photos")
        .createSignedUrl(fullPath, 60 * 60 * 24 * 365) // 1 year

      return {
        name: file.name,
        path: fullPath,
        url: signedData?.signedUrl || "",
      }
    })
  )

  return photosWithUrls
}
