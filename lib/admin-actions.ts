"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  AdminProfile,
  AdminProject,
  LayoutDB,
  TemplateCategory,
  CreateLayoutInput,
  UpdateLayoutInput,
  CreateTemplateCategoryInput,
  UpdateTemplateCategoryInput,
} from "@/types/template"
import type { Voucher } from "@/types/voucher"
import type { PageCount, PaperSize, Project } from "@/types/editor"

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
      zones!zones_layout_id_fkey (*)
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
      zones!zones_layout_id_fkey (*)
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
      page_id: null, // Layout zones have page_id=NULL
      zone_index: i,
      zone_type: z.zone_type,
      position_x: z.position_x,
      position_y: z.position_y,
      width: z.width,
      height: z.height,
    }))

    const { error: zonesError } = await supabase
      .from("zones")
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
    await supabase.from("zones").delete().eq("layout_id", layoutId)

    // Insert new zones
    if (zones.length > 0) {
      const newZones = zones.map((z, i) => ({
        layout_id: layoutId,
        page_id: null, // Layout zones have page_id=NULL
        zone_index: i,
        zone_type: z.zone_type,
        position_x: z.position_x,
        position_y: z.position_y,
        width: z.width,
        height: z.height,
      }))

      const { error } = await supabase.from("zones").insert(newZones)
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
// (Templates are now projects with is_template=TRUE)
// ============================================

/**
 * Get all templates (including inactive) for admin
 */
export async function getAdminTemplates(): Promise<AdminProject[]> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      category:template_categories(*)
    `)
    .eq("is_template", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching templates:", error)
    return []
  }

  return data as AdminProject[]
}

/**
 * Get a single template with pages for admin
 */
export async function getAdminTemplate(templateId: string): Promise<Project | null> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      category:template_categories(*),
      pages(
        *,
        page_zones(*)
      )
    `)
    .eq("id", templateId)
    .eq("is_template", true)
    .single()

  if (error) return null

  const template = data as Project
  if (template.pages) {
    template.pages.sort((a, b) => a.page_number - b.page_number)
  }

  return template
}

/**
 * Create a new template
 */
export async function createTemplate(input: {
  slug: string
  title: string
  description?: string
  category_id?: string
  thumbnail_url?: string
  page_count?: PageCount
  paper_size?: PaperSize
  pages: Array<{ page_number: number; layout_slug: string; title?: string }>
}): Promise<Project> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Create template project
  const { data: template, error: templateError } = await supabase
    .from("projects")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      category_id: input.category_id,
      thumbnail_url: input.thumbnail_url,
      page_count: input.page_count || input.pages.length,
      paper_size: input.paper_size,
      is_template: true,
      is_active: true,
      user_id: null, // Templates have no owner
    })
    .select()
    .single()

  if (templateError) throw templateError

  // Create template pages with zones copied from layouts
  if (input.pages.length > 0) {
    for (const pageInput of input.pages) {
      // Create page
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .insert({
          project_id: template.id,
          page_number: pageInput.page_number,
          title: pageInput.title,
          is_template: true,
        })
        .select()
        .single()

      if (pageError) throw pageError

      // Copy zones from layout
      if (pageInput.layout_slug && pageInput.layout_slug !== 'blank') {
        const { data: layout } = await supabase
          .from("layouts")
          .select("id, zones!zones_layout_id_fkey(*)")
          .eq("slug", pageInput.layout_slug)
          .single()

        if (layout && layout.zones && layout.zones.length > 0) {
          const zonesToCreate = layout.zones.map((zone: any) => ({
            page_id: page.id,
            layout_id: null, // Page zones have layout_id=NULL
            zone_index: zone.zone_index,
            position_x: zone.position_x,
            position_y: zone.position_y,
            width: zone.width,
            height: zone.height,
            zone_type: zone.zone_type,
          }))

          const { error: zonesError } = await supabase
            .from("zones")
            .insert(zonesToCreate)

          if (zonesError) throw zonesError
        }
      }
    }
  }

  revalidatePath("/admin/templates")

  return (await getAdminTemplate(template.id))!
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  input: {
    title?: string
    slug?: string
    description?: string
    category_id?: string
    thumbnail_url?: string
    preview_images?: string[]
    is_featured?: boolean
    is_premium?: boolean
    is_active?: boolean
    page_count?: PageCount
    paper_size?: PaperSize
  }
): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", templateId)
    .eq("is_template", true)

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
    .from("projects")
    .delete()
    .eq("id", templateId)
    .eq("is_template", true)

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

  // Create page
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .insert({
      project_id: templateId,
      page_number: pageNumber,
      title,
      is_template: true,
    })
    .select()
    .single()

  if (pageError) throw pageError

  // Copy zones from layout
  if (layoutSlug && layoutSlug !== 'blank') {
    const { data: layout } = await supabase
      .from("layouts")
      .select("id, zones!zones_layout_id_fkey(*)")
      .eq("slug", layoutSlug)
      .single()

    if (layout && layout.zones && layout.zones.length > 0) {
      const zonesToCreate = layout.zones.map((zone: any) => ({
        page_id: page.id,
        layout_id: null, // Page zones have layout_id=NULL
        zone_index: zone.zone_index,
        position_x: zone.position_x,
        position_y: zone.position_y,
        width: zone.width,
        height: zone.height,
        zone_type: zone.zone_type,
      }))

      const { error: zonesError } = await supabase
        .from("zones")
        .insert(zonesToCreate)

      if (zonesError) throw zonesError
    }
  }

  // Update page count
  const { data: pages } = await supabase
    .from("pages")
    .select("id")
    .eq("project_id", templateId)

  await supabase
    .from("projects")
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

  // Update title if provided
  if (title !== undefined) {
    const { error } = await supabase
      .from("pages")
      .update({ title })
      .eq("id", pageId)

    if (error) throw error
  }

  // Update layout by copying zones
  if (layoutSlug !== undefined) {
    // Delete existing zones
    await supabase.from("zones").delete().eq("page_id", pageId)

    // Copy zones from new layout
    if (layoutSlug && layoutSlug !== 'blank') {
      const { data: layout } = await supabase
        .from("layouts")
        .select("id, zones!zones_layout_id_fkey(*)")
        .eq("slug", layoutSlug)
        .single()

      if (layout && layout.zones && layout.zones.length > 0) {
        const zonesToCreate = layout.zones.map((zone: any) => ({
          page_id: pageId,
          layout_id: null, // Page zones have layout_id=NULL
          zone_index: zone.zone_index,
          position_x: zone.position_x,
          position_y: zone.position_y,
          width: zone.width,
          height: zone.height,
          zone_type: zone.zone_type,
        }))

        const { error: zonesError } = await supabase
          .from("zones")
          .insert(zonesToCreate)

        if (zonesError) throw zonesError
      }
    }
  }

  // Get template ID for revalidation
  const { data: page } = await supabase
    .from("pages")
    .select("project_id")
    .eq("id", pageId)
    .single()

  if (page) {
    revalidatePath(`/admin/templates/${page.project_id}`)
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
    .from("pages")
    .select("project_id")
    .eq("id", pageId)
    .single()

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", pageId)

  if (error) throw error

  // Update page count
  if (page) {
    const { data: pages } = await supabase
      .from("pages")
      .select("id")
      .eq("project_id", page.project_id)

    await supabase
      .from("projects")
      .update({ page_count: pages?.length || 0 })
      .eq("id", page.project_id)

    revalidatePath(`/admin/templates/${page.project_id}`)
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
      .from("pages")
      .update({ page_number: i + 1 })
      .eq("id", pageIds[i])
  }

  revalidatePath(`/admin/templates/${templateId}`)
}

// ============================================
// VOUCHER ADMIN ACTIONS
// ============================================

/**
 * Get all vouchers for admin with optional filtering
 */
export async function getVouchers(filters?: {
  status?: string
}): Promise<Voucher[]> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  let query = supabase
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false })

  // Apply status filter if provided
  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching vouchers:", error)
    return []
  }

  return data as Voucher[]
}

/**
 * Create a new voucher
 */
export async function createVoucher(input: {
  code: string
  page_count: PageCount
  paper_size: PaperSize
}): Promise<Voucher> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Normalize voucher code (uppercase, trim)
  const normalizedCode = input.code.trim().toUpperCase()

  if (!normalizedCode) {
    throw new Error("Voucher code is required")
  }

  // Check if code already exists
  const { data: existing } = await supabase
    .from("vouchers")
    .select("id")
    .eq("code", normalizedCode)
    .single()

  if (existing) {
    throw new Error("A voucher with this code already exists")
  }

  // Create voucher
  const { data, error } = await supabase
    .from("vouchers")
    .insert({
      code: normalizedCode,
      page_count: input.page_count,
      paper_size: input.paper_size,
      status: 'not_redeemed',
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating voucher:", error)
    throw new Error("Failed to create voucher")
  }

  revalidatePath("/admin/vouchers")

  return data as Voucher
}

/**
 * Delete a voucher
 * Only allows deletion of not_redeemed vouchers
 */
export async function deleteVoucher(id: string): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Check if voucher can be deleted (only not_redeemed)
  const { data: voucher } = await supabase
    .from("vouchers")
    .select("status")
    .eq("id", id)
    .single()

  if (!voucher) {
    throw new Error("Voucher not found")
  }

  if (voucher.status !== 'not_redeemed') {
    throw new Error("Cannot delete a voucher that has been used or is in use")
  }

  // Delete voucher
  const { error } = await supabase
    .from("vouchers")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting voucher:", error)
    throw new Error("Failed to delete voucher")
  }

  revalidatePath("/admin/vouchers")
}

// ============================================
// ORDER MANAGEMENT
// ============================================

/**
 * Get all projects from all users for admin
 * Joins with profiles to get user information
 */
export async function getAdminProjects() {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // After migration, projects.user_id now references profiles.id
  // This allows Supabase's automatic JOIN to work
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      user:profiles (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .order("last_edited_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin projects:", error)
    return []
  }

  return data || []
}

/**
 * Update project status (admin only)
 * Validates status is valid enum value
 */
export async function updateProjectStatus(
  projectId: string,
  status: 'draft' | 'processed' | 'shipped' | 'completed'
): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Validate status enum
  const validStatuses = ['draft', 'processed', 'shipped', 'completed']
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`)
  }

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId)

  if (error) {
    console.error("Error updating project status:", error)
    throw new Error("Failed to update project status")
  }

  revalidatePath("/admin/orders")
}
