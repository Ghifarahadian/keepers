"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  AdminProfile,
  LayoutDB,
  Template,
  TemplateCategory,
  CreateLayoutInput,
  UpdateLayoutInput,
  CreateTemplateCategoryInput,
  UpdateTemplateCategoryInput,
  CreateTemplateInput,
  UpdateTemplateInput,
} from "@/types/template"

// ============================================
// ADMIN AUTH ACTIONS
// ============================================

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  return data?.is_admin === true
}

/**
 * Get admin profile for the current user
 * Returns null if user is not an admin
 */
export async function getAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .eq("is_admin", true)
    .single()

  if (!data) return null

  return data as AdminProfile
}

// ============================================
// LAYOUT ADMIN ACTIONS
// ============================================

/**
 * Get all layouts (including inactive) for admin
 */
export async function getAdminLayouts(): Promise<LayoutDB[]> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("layouts")
    .select(`
      *,
      layout_zones (*)
    `)
    .order("sort_order")

  if (error) {
    console.error("Error fetching layouts:", error)
    return []
  }

  return data as LayoutDB[]
}

/**
 * Get a single layout by ID for admin
 */
export async function getAdminLayout(layoutId: string): Promise<LayoutDB | null> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("layouts")
    .select(`
      *,
      layout_zones (*)
    `)
    .eq("id", layoutId)
    .single()

  if (error) return null

  return data as LayoutDB
}

/**
 * Create a new layout
 */
export async function createLayout(input: CreateLayoutInput): Promise<LayoutDB> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Create layout
  const { data: layout, error: layoutError } = await supabase
    .from("layouts")
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description,
      icon: input.icon,
      is_system: false,
    })
    .select()
    .single()

  if (layoutError) throw layoutError

  // Create zones
  if (input.zones.length > 0) {
    const zones = input.zones.map((z, i) => ({
      layout_id: layout.id,
      zone_index: i,
      position_x: z.position_x,
      position_y: z.position_y,
      width: z.width,
      height: z.height,
    }))

    const { error: zonesError } = await supabase
      .from("layout_zones")
      .insert(zones)

    if (zonesError) throw zonesError
  }

  revalidatePath("/admin/layouts")

  // Fetch the complete layout with zones
  return (await getAdminLayout(layout.id))!
}

/**
 * Update a layout
 */
export async function updateLayout(
  layoutId: string,
  input: UpdateLayoutInput
): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { zones, ...layoutUpdates } = input

  // Update layout fields
  if (Object.keys(layoutUpdates).length > 0) {
    const { error } = await supabase
      .from("layouts")
      .update(layoutUpdates)
      .eq("id", layoutId)

    if (error) throw error
  }

  // Update zones if provided
  if (zones !== undefined) {
    // Delete existing zones
    await supabase.from("layout_zones").delete().eq("layout_id", layoutId)

    // Insert new zones
    if (zones.length > 0) {
      const newZones = zones.map((z, i) => ({
        layout_id: layoutId,
        zone_index: i,
        position_x: z.position_x,
        position_y: z.position_y,
        width: z.width,
        height: z.height,
      }))

      const { error } = await supabase.from("layout_zones").insert(newZones)
      if (error) throw error
    }
  }

  revalidatePath("/admin/layouts")
  revalidatePath(`/admin/layouts/${layoutId}`)
}

/**
 * Delete a layout (only non-system layouts)
 */
export async function deleteLayout(layoutId: string): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Check if system layout
  const { data } = await supabase
    .from("layouts")
    .select("is_system")
    .eq("id", layoutId)
    .single()

  if (data?.is_system) {
    throw new Error("Cannot delete system layouts")
  }

  const { error } = await supabase.from("layouts").delete().eq("id", layoutId)

  if (error) throw error

  revalidatePath("/admin/layouts")
}

// ============================================
// TEMPLATE CATEGORY ADMIN ACTIONS
// ============================================

/**
 * Get all categories (including inactive) for admin
 */
export async function getAdminCategories(): Promise<TemplateCategory[]> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("template_categories")
    .select("*")
    .order("sort_order")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data as TemplateCategory[]
}

/**
 * Create a new template category
 */
export async function createCategory(
  input: CreateTemplateCategoryInput
): Promise<TemplateCategory> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("template_categories")
    .insert(input)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/categories")

  return data as TemplateCategory
}

/**
 * Update a template category
 */
export async function updateCategory(
  categoryId: string,
  input: UpdateTemplateCategoryInput
): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("template_categories")
    .update(input)
    .eq("id", categoryId)

  if (error) throw error

  revalidatePath("/admin/categories")
}

/**
 * Delete a template category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("template_categories")
    .delete()
    .eq("id", categoryId)

  if (error) throw error

  revalidatePath("/admin/categories")
}

// ============================================
// TEMPLATE ADMIN ACTIONS
// ============================================

/**
 * Get all templates (including inactive) for admin
 */
export async function getAdminTemplates(): Promise<Template[]> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("templates")
    .select(`
      *,
      category:template_categories(*)
    `)
    .order("sort_order")

  if (error) {
    console.error("Error fetching templates:", error)
    return []
  }

  return data as Template[]
}

/**
 * Get a single template with pages for admin
 */
export async function getAdminTemplate(templateId: string): Promise<Template | null> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("templates")
    .select(`
      *,
      category:template_categories(*),
      template_pages(
        *,
        layout:layouts(*, layout_zones(*)),
        template_elements(*)
      )
    `)
    .eq("id", templateId)
    .single()

  if (error) return null

  const template = data as Template
  if (template.template_pages) {
    template.template_pages.sort((a, b) => a.page_number - b.page_number)
  }

  return template
}

/**
 * Create a new template
 */
export async function createTemplate(input: CreateTemplateInput): Promise<Template> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Create template
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description,
      category_id: input.category_id,
      thumbnail_url: input.thumbnail_url,
      page_count: input.pages.length,
      created_by: user?.id,
    })
    .select()
    .single()

  if (templateError) throw templateError

  // Get layout IDs from slugs
  const layoutSlugs = input.pages.map((p) => p.layout_slug)
  const { data: layouts } = await supabase
    .from("layouts")
    .select("id, slug")
    .in("slug", layoutSlugs)

  const layoutMap = new Map(layouts?.map((l) => [l.slug, l.id]) || [])

  // Create template pages
  if (input.pages.length > 0) {
    const pages = input.pages.map((p) => ({
      template_id: template.id,
      page_number: p.page_number,
      layout_id: layoutMap.get(p.layout_slug) || null,
      title: p.title,
    }))

    const { error: pagesError } = await supabase
      .from("template_pages")
      .insert(pages)

    if (pagesError) throw pagesError
  }

  revalidatePath("/admin/templates")

  return (await getAdminTemplate(template.id))!
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  input: UpdateTemplateInput
): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("templates")
    .update(input)
    .eq("id", templateId)

  if (error) throw error

  revalidatePath("/admin/templates")
  revalidatePath(`/admin/templates/${templateId}`)
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId)

  if (error) throw error

  revalidatePath("/admin/templates")
}

/**
 * Add a page to a template
 */
export async function addTemplatePage(
  templateId: string,
  pageNumber: number,
  layoutSlug: string,
  title?: string
): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Get layout ID from slug
  const { data: layout } = await supabase
    .from("layouts")
    .select("id")
    .eq("slug", layoutSlug)
    .single()

  const { error } = await supabase.from("template_pages").insert({
    template_id: templateId,
    page_number: pageNumber,
    layout_id: layout?.id || null,
    title,
  })

  if (error) throw error

  // Update page count
  const { data: pages } = await supabase
    .from("template_pages")
    .select("id")
    .eq("template_id", templateId)

  await supabase
    .from("templates")
    .update({ page_count: pages?.length || 0 })
    .eq("id", templateId)

  revalidatePath(`/admin/templates/${templateId}`)
}

/**
 * Update a template page
 */
export async function updateTemplatePage(
  pageId: string,
  layoutSlug?: string,
  title?: string | null
): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const updates: Record<string, unknown> = {}

  if (layoutSlug !== undefined) {
    const { data: layout } = await supabase
      .from("layouts")
      .select("id")
      .eq("slug", layoutSlug)
      .single()

    updates.layout_id = layout?.id || null
  }

  if (title !== undefined) {
    updates.title = title
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("template_pages")
      .update(updates)
      .eq("id", pageId)

    if (error) throw error
  }

  // Get template ID for revalidation
  const { data: page } = await supabase
    .from("template_pages")
    .select("template_id")
    .eq("id", pageId)
    .single()

  if (page) {
    revalidatePath(`/admin/templates/${page.template_id}`)
  }
}

/**
 * Delete a template page
 */
export async function deleteTemplatePage(pageId: string): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Get template ID before deletion
  const { data: page } = await supabase
    .from("template_pages")
    .select("template_id")
    .eq("id", pageId)
    .single()

  const { error } = await supabase
    .from("template_pages")
    .delete()
    .eq("id", pageId)

  if (error) throw error

  // Update page count
  if (page) {
    const { data: pages } = await supabase
      .from("template_pages")
      .select("id")
      .eq("template_id", page.template_id)

    await supabase
      .from("templates")
      .update({ page_count: pages?.length || 0 })
      .eq("id", page.template_id)

    revalidatePath(`/admin/templates/${page.template_id}`)
  }
}

/**
 * Reorder template pages
 */
export async function reorderTemplatePages(
  templateId: string,
  pageIds: string[]
): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Update page numbers based on new order
  for (let i = 0; i < pageIds.length; i++) {
    await supabase
      .from("template_pages")
      .update({ page_number: i + 1 })
      .eq("id", pageIds[i])
  }

  revalidatePath(`/admin/templates/${templateId}`)
}
