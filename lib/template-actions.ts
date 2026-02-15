"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Project } from "@/types/editor"
import type { Template, TemplateCategory } from "@/types/template"
import { applyVoucherToProject } from "@/lib/voucher-actions"
import { copyZones } from "@/lib/zone-operations"
import { fetchLayoutsByIdsWithZones } from "@/lib/zone-queries"

// ============================================
// TEMPLATE CATEGORY ACTIONS
// ============================================

/**
 * Get all active template categories
 */
export async function getTemplateCategories(): Promise<TemplateCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("template_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")

  if (error) {
    console.error("Error fetching template categories:", error)
    return []
  }

  return data as TemplateCategory[]
}

/**
 * Get a single template category by slug
 */
export async function getTemplateCategoryBySlug(
  slug: string
): Promise<TemplateCategory | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("template_categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  return data as TemplateCategory
}

// ============================================
// TEMPLATE ACTIONS
// ============================================

/**
 * Get all active templates with optional category filter
 */
export async function getTemplates(
  categorySlug?: string
): Promise<Template[]> {
  const supabase = await createClient()

  let query = supabase
    .from("templates")
    .select(`
      *,
      category:template_categories(*)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Add category filter if specified
  if (categorySlug) {
    const category = await getTemplateCategoryBySlug(categorySlug)
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching templates:", error)
    return []
  }

  return data as Template[]
}

/**
 * Get featured templates
 */
export async function getFeaturedTemplates(): Promise<Template[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("templates")
    .select(`
      *,
      category:template_categories(*)
    `)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6)

  if (error) {
    console.error("Error fetching featured templates:", error)
    return []
  }

  return data as Template[]
}

/**
 * Get a single template by ID
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("templates")
    .select(`
      *,
      category:template_categories(*)
    `)
    .eq("id", templateId)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    console.error("Error fetching template:", error)
    return null
  }

  return data as Template
}

/**
 * Get a template by slug
 */
export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("templates")
    .select(`
      *,
      category:template_categories(*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  return data as Template
}

// ============================================
// PROJECT FROM TEMPLATE ACTIONS
// ============================================

/**
 * Create a new project from a template
 * Fetches layouts live from DB and copies zones fresh — layout updates are always reflected
 */
export async function createProjectFromTemplate(
  templateId: string,
  projectTitle?: string,
  voucherCode?: string
): Promise<Project> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Fetch template (no template_project join needed)
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id, title, page_count, paper_size, layout_ids")
    .eq("id", templateId)
    .eq("is_active", true)
    .single()

  if (templateError || !template) {
    throw new Error("Template not found")
  }

  const layoutIds: string[] = template.layout_ids || []

  if (!template.page_count || layoutIds.length !== template.page_count) {
    throw new Error("Template configuration is invalid")
  }

  // Create new user project from template configuration
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: projectTitle || template.title,
      page_count: template.page_count,
      paper_size: template.paper_size,
      voucher_code: voucherCode || null,
      status: "draft",
    })
    .select()
    .single()

  if (projectError) throw projectError

  // If voucher was provided, apply it (set status to 'being_redeemed')
  if (voucherCode) {
    const applyResult = await applyVoucherToProject(voucherCode, project.id)
    if (!applyResult.success) {
      await supabase.from("projects").delete().eq("id", project.id)
      throw new Error(applyResult.error || "Failed to apply voucher")
    }
  }

  // Batch fetch all unique layouts with their zones (single query)
  const uniqueLayoutIds = [...new Set(layoutIds)]
  const layouts = await fetchLayoutsByIdsWithZones(uniqueLayoutIds)
  const layoutZonesMap: Record<string, typeof layouts[0]['zones']> = {}
  for (const layout of layouts) {
    layoutZonesMap[layout.id] = layout.zones || []
  }

  // Create pages and copy zones from live layout definitions
  for (let i = 0; i < layoutIds.length; i++) {
    const layoutId = layoutIds[i]
    const pageNumber = i + 1

    const { data: newPage, error: pageError } = await supabase
      .from("pages")
      .insert({
        project_id: project.id,
        page_number: pageNumber,
      })
      .select()
      .single()

    if (pageError) throw pageError

    const zones = layoutZonesMap[layoutId] || []
    if (zones.length > 0) {
      await copyZones(zones, 'page', newPage.id)
    }
  }

  revalidatePath("/editor/new")
  revalidatePath(`/editor/${project.id}`)

  return project as Project
}
