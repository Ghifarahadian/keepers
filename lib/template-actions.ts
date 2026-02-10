"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Project } from "@/types/editor"
import type { Template, TemplateCategory } from "@/types/template"
import { applyVoucherToProject } from "@/lib/voucher-actions"
import { copyZones } from "@/lib/zone-operations"

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
 * Get a single template with all pages and zones (via project_id)
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("templates")
    .select(`
      *,
      category:template_categories(*),
      template_project:projects!project_id (
        *,
        pages (
          *,
          zones!zones_page_id_fkey (*)
        )
      )
    `)
    .eq("id", templateId)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    console.error("Error fetching template:", error)
    return null
  }

  // Map template_project.pages to template.pages for backward compatibility
  const template = data as any
  if (template.template_project?.pages) {
    template.pages = template.template_project.pages
    template.pages.sort((a: any, b: any) => a.page_number - b.page_number)
  }

  return template as Template
}

/**
 * Get a template by slug (via project_id)
 */
export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("templates")
    .select(`
      *,
      category:template_categories(*),
      template_project:projects!project_id (
        *,
        pages (
          *,
          zones!zones_page_id_fkey (*)
        )
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  // Map template_project.pages to template.pages for backward compatibility
  const template = data as any
  if (template.template_project?.pages) {
    template.pages = template.template_project.pages
    template.pages.sort((a: any, b: any) => a.page_number - b.page_number)
  }

  return template as Template
}

// ============================================
// PROJECT FROM TEMPLATE ACTIONS
// ============================================

/**
 * Create a new project from a template
 * Copies template's project (with pages and zones) to create a new user project
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

  // Get template with its project_id
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select(`
      *,
      template_project:projects!project_id (
        *,
        pages (
          *,
          zones!zones_page_id_fkey (*)
        )
      )
    `)
    .eq("id", templateId)
    .eq("is_active", true)
    .single()

  if (templateError || !template || !template.template_project) {
    throw new Error("Template not found")
  }

  const templateProject = template.template_project

  // Create new project (copy configuration from template's project)
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: projectTitle || template.title,
      page_count: templateProject.page_count,
      paper_size: templateProject.paper_size,
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
      // If voucher application fails, delete the project and throw error
      await supabase.from("projects").delete().eq("id", project.id)
      throw new Error(applyResult.error || "Failed to apply voucher")
    }
  }

  // Copy pages from template project
  if (templateProject.pages && templateProject.pages.length > 0) {
    for (const templatePage of templateProject.pages) {
      // Create page
      const { data: newPage, error: pageError } = await supabase
        .from("pages")
        .insert({
          project_id: project.id,
          page_number: templatePage.page_number,
          title: templatePage.title,
        })
        .select()
        .single()

      if (pageError) throw pageError

      // Copy zones for this page using shared utility
      if (templatePage.zones && templatePage.zones.length > 0) {
        const newZones = await copyZones(templatePage.zones, 'page', newPage.id)

        // Copy elements for each zone (if any exist in template)
        if (newZones && templatePage.zones.length > 0) {
          const { data: templateElements, error: elementsQueryError } = await supabase
            .from("elements")
            .select("*")
            .in("zone_id", templatePage.zones.map((z: any) => z.id))

          if (elementsQueryError) {
            console.error("Error fetching template elements:", elementsQueryError)
          } else if (templateElements && templateElements.length > 0) {
            // Map old zone IDs to new zone IDs
            const zoneIdMap: Record<string, string> = {}
            templatePage.zones.forEach((oldZone: any, index: number) => {
              zoneIdMap[oldZone.id] = newZones[index].id
            })

            const elementsToCreate = templateElements.map((element: any) => ({
              zone_id: zoneIdMap[element.zone_id],
              type: element.type,
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
      })

      pagesToCreate.push({
        project_id: project.id,
        page_number: rightPageNumber,
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
