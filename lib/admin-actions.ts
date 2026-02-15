"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  AdminProfile,
  AdminProject,
  Template,
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
} from "@/lib/zone-queries"
import { createZones, deleteZonesForParent } from "@/lib/zone-operations"

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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching templates:", error)
    return []
  }

  return data as Template[]
}

/**
 * Get a single template for admin
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
      category:template_categories(*)
    `)
    .eq("id", templateId)
    .single()

  if (error) return null

  return data as Template
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
  page_count: PageCount
  paper_size: PaperSize
  layout_ids: string[] // Ordered array of layout UUIDs, length must equal page_count
  is_featured?: boolean
}) {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  if (input.layout_ids.length !== input.page_count) {
    throw new Error(`layout_ids length (${input.layout_ids.length}) must match page_count (${input.page_count})`)
  }

  // Validate that all layout UUIDs exist
  const uniqueIds = [...new Set(input.layout_ids)]
  const { data: existingLayouts, error: layoutCheckError } = await supabase
    .from("layouts")
    .select("id")
    .in("id", uniqueIds)

  if (layoutCheckError) throw layoutCheckError

  if (existingLayouts.length !== uniqueIds.length) {
    throw new Error("One or more layout IDs are invalid")
  }

  const { data: template, error: templateError } = await supabase
    .from("templates")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      category_id: input.category_id,
      page_count: input.page_count,
      paper_size: input.paper_size,
      layout_ids: input.layout_ids,
      thumbnail_url: input.thumbnail_url,
      is_featured: input.is_featured ?? false,
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
    layout_ids?: string[]
  }
): Promise<void> {
  const supabase = await createClient()

  if (!(await isAdmin())) {
    throw new Error("Unauthorized")
  }

  // Validate layout_ids length if provided
  if (input.layout_ids !== undefined) {
    const targetPageCount = input.page_count ?? (await (async () => {
      const { data } = await supabase
        .from("templates")
        .select("page_count")
        .eq("id", templateId)
        .single()
      return data?.page_count
    })())

    if (targetPageCount !== undefined && input.layout_ids.length !== targetPageCount) {
      throw new Error(`layout_ids length (${input.layout_ids.length}) must match page_count (${targetPageCount})`)
    }

    // Validate all layout UUIDs exist
    const uniqueIds = [...new Set(input.layout_ids)]
    const { data: existingLayouts, error: layoutCheckError } = await supabase
      .from("layouts")
      .select("id")
      .in("id", uniqueIds)

    if (layoutCheckError) throw layoutCheckError

    if (existingLayouts.length !== uniqueIds.length) {
      throw new Error("One or more layout IDs are invalid")
    }
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
