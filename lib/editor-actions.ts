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
      status: "draft",
    })
    .select()
    .single()

  if (projectError) throw projectError

  // Create first page
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .insert({
      project_id: project.id,
      page_number: 1,
      layout_id: "blank",
    })
    .select()
    .single()

  if (pageError) throw pageError

  return {
    ...project,
    pages: [{ ...page, elements: [] }],
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
    console.error("Error fetching project:", error)
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

  const { data: page, error } = await supabase
    .from("pages")
    .insert({
      project_id: input.project_id,
      page_number: input.page_number,
      layout_id: input.layout_id || "blank",
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

  const { error } = await supabase
    .from("pages")
    .update(updates)
    .eq("id", pageId)

  if (error) throw error
}

export async function deletePage(pageId: string, projectId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("pages").delete().eq("id", pageId)

  if (error) throw error

  revalidatePath(`/editor/${projectId}`)
}

export async function reorderPages(
  projectId: string,
  pageIds: string[]
): Promise<void> {
  const supabase = await createClient()

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

  const { error } = await supabase
    .from("elements")
    .update(updates)
    .eq("id", elementId)

  if (error) throw error
}

export async function deleteElement(elementId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from("elements").delete().eq("id", elementId)

  if (error) throw error
}

export async function batchUpdateElements(
  updates: Array<{ id: string; data: UpdateElementInput }>
): Promise<void> {
  const supabase = await createClient()

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

  const { error } = await supabase
    .from("elements")
    .delete()
    .in("id", elementIds)

  if (error) throw error
}
