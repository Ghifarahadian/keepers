"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  Project,
  Page,
  Element,
  CreateProjectInput,
  UpdateProjectInput,
  CreatePageInput,
  UpdatePageInput,
  CreateElementInput,
  UpdateElementInput,
} from "@/types/editor"
import { applyVoucherToProject, revertVoucher } from "@/lib/voucher-actions"

// ============================================
// PROJECT ACTIONS
// ============================================

export async function createProject(
  input?: CreateProjectInput
): Promise<Project> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: input?.title || "Untitled Project",
      page_count: input?.page_count || 30,
      paper_size: input?.paper_size || 'A4',
      voucher_code: input?.voucher_code || null,
      status: "draft",
    })
    .select()
    .single()

  if (projectError) throw projectError

  // If voucher was provided, apply it (set status to 'being_redeemed')
  if (input?.voucher_code) {
    const applyResult = await applyVoucherToProject(input.voucher_code, project.id)
    if (!applyResult.success) {
      // If voucher application fails, delete the project and throw error
      await supabase.from("projects").delete().eq("id", project.id)
      throw new Error(applyResult.error || "Failed to apply voucher")
    }
  }

  // Create all spreads upfront based on page_count
  const pageCount = project.page_count
  const totalSpreads = pageCount / 2
  const pagesToCreate = []

  // Create pages for all spreads
  for (let spreadIndex = 0; spreadIndex < totalSpreads; spreadIndex++) {
    const leftPageNumber = spreadIndex * 2 + 1
    const rightPageNumber = spreadIndex * 2 + 2

    // First spread is cover, rest are blank
    const layoutId = "blank"

    pagesToCreate.push({
      project_id: project.id,
      page_number: leftPageNumber,
      layout_id: layoutId,
    })

    pagesToCreate.push({
      project_id: project.id,
      page_number: rightPageNumber,
      layout_id: layoutId,
    })
  }

  // Insert all pages at once
  const { data: pages, error: pagesError } = await supabase
    .from("pages")
    .insert(pagesToCreate)
    .select()

  if (pagesError) {
    console.error("Error creating pages:", pagesError)
    throw new Error(`Failed to create pages: ${pagesError.message || JSON.stringify(pagesError)}`)
  }

  if (!pages || pages.length === 0) {
    throw new Error("No pages were created")
  }

  return {
    ...project,
    pages: pages.map(page => ({ ...page, elements: [] })),
  }
}

export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get project with pages and elements
  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      pages (
        *,
        elements (*)
      )
    `
    )
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching project:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      projectId,
      userId: user.id,
    })
    return null
  }

  if (!project) {
    console.error("Project not found:", { projectId, userId: user.id })
    return null
  }

  // Sort pages by page_number and elements by z_index
  if (project && project.pages) {
    project.pages = project.pages
      .sort((a: Page, b: Page) => a.page_number - b.page_number)
      .map((page: Page) => ({
        ...page,
        elements: page.elements
          ? page.elements.sort((a: Element, b: Element) => a.z_index - b.z_index)
          : [],
      }))
  }

  return project as Project
}

export async function updateProject(
  projectId: string,
  updates: UpdateProjectInput
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .eq("user_id", user.id)

  if (error) throw error

  revalidatePath(`/editor/${projectId}`)
}

export async function deleteProject(projectId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership and get project details before deleting
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, voucher_code, status")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (projectError || !project) {
    throw new Error("Project not found or unauthorized")
  }

  // If project has voucher and is still draft, revert voucher
  if (project.voucher_code && project.status === 'draft') {
    await revertVoucher(project.voucher_code)
  }

  // Delete all photos from storage for this project
  const folderPath = `${user.id}/${projectId}`
  try {
    const { data: files } = await supabase.storage
      .from("project-photos")
      .list(folderPath)

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${folderPath}/${file.name}`)
      await supabase.storage.from("project-photos").remove(filePaths)
    }
  } catch (storageError) {
    // Log error but continue with project deletion
    console.error("Storage deletion error:", storageError)
  }

  // Delete project (cascades to pages, elements via DB constraints)
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/")
}

export async function getUserProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("last_edited_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return (projects as Project[]) || []
}

// ============================================
// PAGE ACTIONS
// ============================================

export async function createPage(input: CreatePageInput): Promise<Page> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const layoutId = input.layout_id || "blank"

  const { data: page, error } = await supabase
    .from("pages")
    .insert({
      project_id: input.project_id,
      page_number: input.page_number,
      layout_id: layoutId,
      title: input.title,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath(`/editor/${input.project_id}`)
  return { ...page, elements: [] } as Page
}

export async function updatePage(
  pageId: string,
  updates: UpdatePageInput
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("pages")
    .update(updates)
    .eq("id", pageId)

  if (error) throw error
}

export async function deletePage(pageId: string, projectId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("pages").delete().eq("id", pageId)

  if (error) throw error

  revalidatePath(`/editor/${projectId}`)
}

export async function reorderPages(
  projectId: string,
  pageIds: string[]
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Update page_number for each page
  const updates = pageIds.map((pageId, index) =>
    supabase
      .from("pages")
      .update({ page_number: index + 1 })
      .eq("id", pageId)
  )

  await Promise.all(updates)

  revalidatePath(`/editor/${projectId}`)
}

// ============================================
// ELEMENT ACTIONS
// ============================================

export async function createElement(
  input: CreateElementInput
): Promise<Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: element, error } = await supabase
    .from("elements")
    .insert({
      page_id: input.page_id,
      type: input.type,
      photo_url: input.photo_url,
      photo_storage_path: input.photo_storage_path,
      text_content: input.text_content,
      font_family: input.font_family,
      font_size: input.font_size,
      font_color: input.font_color,
      position_x: input.position_x,
      position_y: input.position_y,
      width: input.width,
      height: input.height,
      rotation: input.rotation || 0,
      z_index: input.z_index || 0,
    })
    .select()
    .single()

  if (error) throw error

  return element as Element
}

export async function updateElement(
  elementId: string,
  updates: UpdateElementInput
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("elements")
    .update(updates)
    .eq("id", elementId)

  if (error) throw error
}

export async function deleteElement(elementId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("elements").delete().eq("id", elementId)

  if (error) throw error
}

export async function batchUpdateElements(
  updates: Array<{ id: string; data: UpdateElementInput }>
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Execute updates in parallel
  const promises = updates.map(({ id, data }) =>
    supabase.from("elements").update(data).eq("id", id)
  )

  const results = await Promise.all(promises)

  // Check for errors
  const errors = results.filter((result) => result.error)
  if (errors.length > 0) {
    console.error("Batch update errors:", errors)
    throw new Error("Failed to update some elements")
  }
}

export async function batchDeleteElements(elementIds: string[]): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("elements")
    .delete()
    .in("id", elementIds)

  if (error) throw error
}
