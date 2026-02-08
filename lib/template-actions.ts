"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Project } from "@/types/editor"
import type { TemplateCategory } from "@/types/template"
import { applyVoucherToProject, revertVoucher } from "@/lib/voucher-actions"

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
// (Templates are now projects with is_template=TRUE)
// ============================================

/**
 * Get all active templates with optional category filter
 */
export async function getTemplates(
  categorySlug?: string
): Promise<Project[]> {
  const supabase = await createClient()

  let query = supabase
    .from("projects")
    .select(`
      *,
      category:template_categories(*)
    `)
    .eq("is_template", true)
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

  return data as Project[]
}

/**
 * Get featured templates
 */
export async function getFeaturedTemplates(): Promise<Project[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      category:template_categories(*)
    `)
    .eq("is_template", true)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6)

  if (error) {
    console.error("Error fetching featured templates:", error)
    return []
  }

  return data as Project[]
}

/**
 * Get a single template with all pages and zones
 */
export async function getTemplate(templateId: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      category:template_categories(*),
      pages(
        *,
        zones!zones_page_id_fkey(*)
      )
    `)
    .eq("id", templateId)
    .eq("is_template", true)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    console.error("Error fetching template:", error)
    return null
  }

  // Sort pages by page_number
  const template = data as Project
  if (template.pages) {
    template.pages.sort((a, b) => a.page_number - b.page_number)
  }

  return template
}

/**
 * Get a template by slug
 */
export async function getTemplateBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      category:template_categories(*),
      pages(
        *,
        zones!zones_page_id_fkey(*)
      )
    `)
    .eq("slug", slug)
    .eq("is_template", true)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  const template = data as Project
  if (template.pages) {
    template.pages.sort((a, b) => a.page_number - b.page_number)
  }

  return template
}

// ============================================
// PROJECT FROM TEMPLATE ACTIONS
// ============================================

/**
 * Create a new project from a template
 * Copies template project, pages, and zones to create a new user project
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

  // Get template with all pages and zones
  const template = await getTemplate(templateId)
  if (!template) {
    throw new Error("Template not found")
  }

  // Create project (copy template data, set is_template=false)
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: projectTitle || template.title,
      page_count: template.page_count,
      paper_size: template.paper_size,
      voucher_code: voucherCode || null,
      status: "draft",
      is_template: false,
    })
    .select()
    .single()

  if (projectError) throw projectError

  // If voucher was provided, apply it (set status to 'being_redeemed')
  if (voucherCode) {
    const applyResult = await applyVoucherToProject(voucherCode, project.id)
    if (!applyResult.success) {
      // If voucher application fails, delete the project and throw error
      await supabase.from("projects").delete().eq("id", project.id)
      throw new Error(applyResult.error || "Failed to apply voucher")
    }
  }

  // Copy pages from template
  if (template.pages && template.pages.length > 0) {
    for (const templatePage of template.pages) {
      // Create page
      const { data: newPage, error: pageError } = await supabase
        .from("pages")
        .insert({
          project_id: project.id,
          page_number: templatePage.page_number,
          title: templatePage.title,
          is_template: false,
        })
        .select()
        .single()

      if (pageError) throw pageError

      // Copy zones for this page
      if (templatePage.zones && templatePage.zones.length > 0) {
        const zonesToCreate = templatePage.zones.map((zone) => ({
          page_id: newPage.id,
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

        if (zonesError) {
          console.error("Error creating zones:", zonesError)
          throw zonesError
        }
      }

      // Copy elements if template has any pre-placed content
      if (templatePage.elements && templatePage.elements.length > 0) {
        const elementsToCreate = templatePage.elements.map((element) => ({
          page_id: newPage.id,
          type: element.type,
          zone_index: element.zone_index,
          photo_url: element.photo_url,
          photo_storage_path: element.photo_storage_path,
          text_content: element.text_content,
          font_family: element.font_family,
          font_size: element.font_size,
          font_color: element.font_color,
          font_weight: element.font_weight,
          font_style: element.font_style,
          text_align: element.text_align,
          text_decoration: element.text_decoration,
          position_x: element.position_x,
          position_y: element.position_y,
          width: element.width,
          height: element.height,
          rotation: element.rotation,
          z_index: element.z_index,
        }))

        const { error: elementsError } = await supabase
          .from("elements")
          .insert(elementsToCreate)

        if (elementsError) {
          console.error("Error creating elements:", elementsError)
          throw elementsError
        }
      }
    }
  } else {
    // If template has no pages, create default blank pages based on page_count
    const pageCount = project.page_count || 30
    const totalSpreads = pageCount / 2
    const pagesToCreate = []

    for (let spreadIndex = 0; spreadIndex < totalSpreads; spreadIndex++) {
      const leftPageNumber = spreadIndex * 2 + 1
      const rightPageNumber = spreadIndex * 2 + 2

      pagesToCreate.push({
        project_id: project.id,
        page_number: leftPageNumber,
        is_template: false,
      })

      pagesToCreate.push({
        project_id: project.id,
        page_number: rightPageNumber,
        is_template: false,
      })
    }

    const { error: pagesError } = await supabase
      .from("pages")
      .insert(pagesToCreate)

    if (pagesError) throw pagesError
  }

  revalidatePath("/editor/new")
  revalidatePath(`/editor/${project.id}`)

  return project as Project
}
