"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Project } from "@/types/editor"
import type { Template, TemplateCategory, LayoutDB } from "@/types/template"

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
    .order("sort_order")

  const { data, error } = await query

  if (error) {
    console.error("Error fetching templates:", error)
    return []
  }

  // Filter by category if specified
  let templates = data as Template[]
  if (categorySlug) {
    templates = templates.filter(
      (t) => t.category?.slug === categorySlug
    )
  }

  return templates
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
    .order("sort_order")
    .limit(6)

  if (error) {
    console.error("Error fetching featured templates:", error)
    return []
  }

  return data as Template[]
}

/**
 * Get a single template with all pages and elements
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  const supabase = await createClient()

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
    .eq("is_active", true)
    .single()

  if (error || !data) {
    console.error("Error fetching template:", error)
    return null
  }

  // Sort pages by page_number
  const template = data as Template
  if (template.template_pages) {
    template.template_pages.sort((a, b) => a.page_number - b.page_number)
  }

  return template
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
      category:template_categories(*),
      template_pages(
        *,
        layout:layouts(*, layout_zones(*)),
        template_elements(*)
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  const template = data as Template
  if (template.template_pages) {
    template.template_pages.sort((a, b) => a.page_number - b.page_number)
  }

  return template
}

// ============================================
// PROJECT FROM TEMPLATE ACTIONS
// ============================================

/**
 * Create a new project from a template
 * Copies all template pages and their layouts to the new project
 */
export async function createProjectFromTemplate(
  templateId: string,
  projectTitle?: string
): Promise<Project> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get template with all pages
  const template = await getTemplate(templateId)
  if (!template) {
    throw new Error("Template not found")
  }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: projectTitle || template.name,
      status: "draft",
    })
    .select()
    .single()

  if (projectError) throw projectError

  const pages: Array<{ id: string; page_number: number; layout_id: string; elements: Array<Record<string, unknown>> }> = []

  // Create pages from template
  if (template.template_pages && template.template_pages.length > 0) {
    for (const templatePage of template.template_pages) {
      // Get layout slug from the layout object
      const layoutSlug = (templatePage.layout as LayoutDB)?.slug || "blank"

      const { data: page, error: pageError } = await supabase
        .from("pages")
        .insert({
          project_id: project.id,
          page_number: templatePage.page_number,
          layout_id: layoutSlug,
          title: templatePage.title,
        })
        .select()
        .single()

      if (pageError) throw pageError

      // Create elements from template elements (text elements, decorations)
      const elements: Array<Record<string, unknown>> = []
      if (templatePage.template_elements && templatePage.template_elements.length > 0) {
        for (const templateElement of templatePage.template_elements) {
          const { data: element, error: elementError } = await supabase
            .from("elements")
            .insert({
              page_id: page.id,
              type: templateElement.type === "decoration" ? "photo" : "text",
              text_content: templateElement.text_content,
              font_family: templateElement.font_family,
              font_size: templateElement.font_size,
              font_color: templateElement.font_color,
              font_weight: templateElement.font_weight,
              font_style: templateElement.font_style,
              text_align: templateElement.text_align,
              position_x: templateElement.position_x,
              position_y: templateElement.position_y,
              width: templateElement.width,
              height: templateElement.height,
              rotation: templateElement.rotation,
              z_index: templateElement.z_index,
            })
            .select()
            .single()

          if (!elementError && element) {
            elements.push(element)
          }
        }
      }

      pages.push({ ...page, elements })
    }
  } else {
    // If template has no pages, create default 2 blank pages
    const { data: page1, error: page1Error } = await supabase
      .from("pages")
      .insert({
        project_id: project.id,
        page_number: 1,
        layout_id: "blank",
      })
      .select()
      .single()

    if (page1Error) throw page1Error

    const { data: page2, error: page2Error } = await supabase
      .from("pages")
      .insert({
        project_id: project.id,
        page_number: 2,
        layout_id: "blank",
      })
      .select()
      .single()

    if (page2Error) throw page2Error

    pages.push({ ...page1, elements: [] }, { ...page2, elements: [] })
  }

  revalidatePath("/editor/new")

  return {
    ...project,
    pages,
  } as Project
}
