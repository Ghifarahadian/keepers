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
import {
  fetchAllLayoutsWithZones,
  fetchLayoutByIdWithZones,
  fetchLayoutDBBySlugWithZones,
} from "@/lib/zone-queries"
import { createZones, deleteZonesForParent, copyZones } from "@/lib/zone-operations"

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
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  return fetchAllLayoutsWithZones()
}

/**
 * Get a single layout by ID for admin
 */
export async function getAdminLayout(layoutId: string): Promise<LayoutDB | null> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  return fetchLayoutByIdWithZones(layoutId)
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

  // Create zones using shared utility
  if (input.zones.length > 0) {
    await createZones({
      parentType: 'layout',
      parentId: layout.id,
      zones: input.zones.map((z, i) => ({
        ...z,
        zone_index: i,
      })),
    })
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
    await deleteZonesForParent('layout', layoutId)

    // Insert new zones using shared utility
    if (zones.length > 0) {
      await createZones({
        parentType: 'layout',
        parentId: layoutId,
        zones: zones.map((z, i) => ({
          ...z,
          zone_index: i,
        })),
      })
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
export async function getAdminTemplates() {
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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching templates:", error)
    return []
  }

  return data
}

/**
 * Get a single template with pages for admin
 */
export async function getAdminTemplate(templateId: string) {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("templates")
    .select(`
      *,
      category:template_categories(*),
      template_project:projects!project_id(
        *,
        pages(
          *,
          zones!zones_page_id_fkey(*)
        )
      )
    `)
    .eq("id", templateId)
    .single()

  if (error) return null

  // Map template_project.pages to data.pages for backward compatibility
  if (data.template_project?.pages) {
    data.pages = data.template_project.pages
    data.pages.sort((a: any, b: any) => a.page_number - b.page_number)
  }

  return data
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
}) {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Step 1: Create a template project (owned by admin)
  const { data: templateProject, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id, // Admin user
      title: `[Template] ${input.title}`,
      page_count: input.page_count || input.pages.length,
      paper_size: input.paper_size || 'A4',
      status: "draft",
    })
    .select()
    .single()

  if (projectError) throw projectError

  // Step 2: Create template pages with zones copied from layouts
  if (input.pages.length > 0) {
    for (const pageInput of input.pages) {
      console.log(`Creating page ${pageInput.page_number} with layout: ${pageInput.layout_slug}`)

      // Create page for template project
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .insert({
          project_id: templateProject.id,
          page_number: pageInput.page_number,
          title: pageInput.title,
          layout_slug: pageInput.layout_slug, // Store which layout was used
        })
        .select()
        .single()

      if (pageError) {
        console.error(`Error creating page ${pageInput.page_number}:`, pageError)
        throw pageError
      }

      console.log(`✓ Page ${pageInput.page_number} created with ID: ${page.id}`)

      // Copy zones from layout using shared utility
      if (pageInput.layout_slug && pageInput.layout_slug !== 'blank') {
        console.log(`Fetching layout "${pageInput.layout_slug}"...`)
        const layout = await fetchLayoutDBBySlugWithZones(pageInput.layout_slug)

        if (!layout) {
          console.error(`✗ Layout "${pageInput.layout_slug}" not found!`)
        } else if (!layout.zones || layout.zones.length === 0) {
          console.warn(`⚠ Layout "${pageInput.layout_slug}" has no zones!`)
        } else {
          console.log(`✓ Layout "${pageInput.layout_slug}" found with ${layout.zones.length} zones`)
          console.log('Zones to copy:', layout.zones)

          try {
            const copiedZones = await copyZones(layout.zones, 'page', page.id)
            console.log(`✓ Successfully copied ${copiedZones.length} zones to page ${pageInput.page_number}`)
          } catch (error) {
            console.error(`✗ Error copying zones to page ${pageInput.page_number}:`, error)
            throw error
          }
        }
      } else {
        console.log(`Page ${pageInput.page_number} is blank, no zones to copy`)
      }
    }
  }

  // Step 3: Create template record with project_id
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      category_id: input.category_id,
      project_id: templateProject.id,
      thumbnail_url: input.thumbnail_url,
      is_active: true,
    })
    .select()
    .single()

  if (templateError) throw templateError

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

  // Extract project-specific fields
  const { page_count, paper_size, ...templateFields } = input

  // Update template fields
  if (Object.keys(templateFields).length > 0) {
    const { error } = await supabase
      .from("templates")
      .update(templateFields)
      .eq("id", templateId)

    if (error) throw error
  }

  // Update template project fields if provided
  if (page_count !== undefined || paper_size !== undefined) {
    const { data: template } = await supabase
      .from("templates")
      .select("project_id")
      .eq("id", templateId)
      .single()

    if (template?.project_id) {
      const projectUpdates: any = {}
      if (page_count !== undefined) projectUpdates.page_count = page_count
      if (paper_size !== undefined) projectUpdates.paper_size = paper_size

      const { error: projectError } = await supabase
        .from("projects")
        .update(projectUpdates)
        .eq("id", template.project_id)

      if (projectError) throw projectError
    }
  }

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

  // Get template's project_id
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("project_id")
    .eq("id", templateId)
    .single()

  if (templateError || !template?.project_id) {
    throw new Error("Template not found or missing project_id")
  }

  // Create page for template project
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .insert({
      project_id: template.project_id,
      page_number: pageNumber,
      title,
    })
    .select()
    .single()

  if (pageError) throw pageError

  // Copy zones from layout using shared utility
  if (layoutSlug && layoutSlug !== 'blank') {
    const layout = await fetchLayoutDBBySlugWithZones(layoutSlug)

    if (layout && layout.zones && layout.zones.length > 0) {
      await copyZones(layout.zones, 'page', page.id)
    }
  }

  // Update template project's page_count
  const { data: pages } = await supabase
    .from("pages")
    .select("id")
    .eq("project_id", template.project_id)

  await supabase
    .from("projects")
    .update({ page_count: pages?.length || 0 })
    .eq("id", template.project_id)

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

  // Update title and/or layout_slug if provided
  const pageUpdates: any = {}
  if (title !== undefined) {
    pageUpdates.title = title
  }
  if (layoutSlug !== undefined) {
    pageUpdates.layout_slug = layoutSlug
  }

  if (Object.keys(pageUpdates).length > 0) {
    const { error } = await supabase
      .from("pages")
      .update(pageUpdates)
      .eq("id", pageId)

    if (error) throw error
  }

  // Update layout by copying zones
  if (layoutSlug !== undefined) {
    // Delete existing zones using shared utility
    await deleteZonesForParent('page', pageId)

    // Copy zones from new layout using shared utility
    if (layoutSlug && layoutSlug !== 'blank') {
      const layout = await fetchLayoutDBBySlugWithZones(layoutSlug)

      if (layout && layout.zones && layout.zones.length > 0) {
        await copyZones(layout.zones, 'page', pageId)
      }
    }
  }

  // Get template ID for revalidation via project_id
  const { data: page } = await supabase
    .from("pages")
    .select("project_id")
    .eq("id", pageId)
    .single()

  if (page?.project_id) {
    // Find template that uses this project
    const { data: template } = await supabase
      .from("templates")
      .select("id")
      .eq("project_id", page.project_id)
      .single()

    if (template) {
      revalidatePath(`/admin/templates/${template.id}`)
    }
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

  // Get project ID before deletion
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

  // Update template project's page count
  if (page?.project_id) {
    const { data: pages } = await supabase
      .from("pages")
      .select("id")
      .eq("project_id", page.project_id)

    await supabase
      .from("projects")
      .update({ page_count: pages?.length || 0 })
      .eq("id", page.project_id)

    // Find template that uses this project
    const { data: template } = await supabase
      .from("templates")
      .select("id")
      .eq("project_id", page.project_id)
      .single()

    if (template) {
      revalidatePath(`/admin/templates/${template.id}`)
    }
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
 * Note: After separation, templates are in separate table
 */
export async function getAdminProjects() {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      user:profiles (
        id,
        first_name,
        last_name,
        email
      ),
      template:templates (
        id,
        slug,
        title
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
