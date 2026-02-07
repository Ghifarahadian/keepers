"use server"

import { createClient } from "@/lib/supabase/server"
import type { Layout, LayoutZone } from "@/types/editor"
import type { LayoutDB } from "@/types/template"

// ============================================
// LAYOUT ACTIONS (Public - for editor)
// ============================================

/**
 * Get all active layouts from the database
 * Returns layouts in the same format as the static LAYOUTS array for backward compatibility
 */
export async function getLayouts(): Promise<Layout[]> {
  const supabase = await createClient()

  const { data: layouts, error } = await supabase
    .from("layouts")
    .select(`
      *,
      layout_zones (*)
    `)
    .eq("is_active", true)
    .order("sort_order")

  if (error) {
    console.error("Error fetching layouts:", error)
    return []
  }

  // Transform to Layout format (using slug as id for backward compatibility)
  return layouts.map((l: LayoutDB & { layout_zones: Array<{ zone_index: number; zone_type?: "photo" | "text"; position_x: number; position_y: number; width: number; height: number }> }) => ({
    id: l.slug, // Use slug as ID for backward compatibility with existing pages
    name: l.name,
    description: l.description || "",
    icon: l.icon || undefined,
    zones: l.layout_zones
      .sort((a, b) => a.zone_index - b.zone_index)
      .map((z) => ({
        position_x: z.position_x,
        position_y: z.position_y,
        width: z.width,
        height: z.height,
        zone_type: z.zone_type || "photo",
      })),
  }))
}

/**
 * Get a single layout by slug
 */
export async function getLayoutBySlug(slug: string): Promise<Layout | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("layouts")
    .select(`
      *,
      layout_zones (*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  return {
    id: data.slug,
    name: data.name,
    description: data.description || "",
    icon: data.icon || undefined,
    zones: data.layout_zones
      .sort((a: { zone_index: number }, b: { zone_index: number }) => a.zone_index - b.zone_index)
      .map((z: { zone_type?: "photo" | "text"; position_x: number; position_y: number; width: number; height: number }) => ({
        position_x: z.position_x,
        position_y: z.position_y,
        width: z.width,
        height: z.height,
        zone_type: z.zone_type || "photo",
      })),
  }
}

/**
 * Get layout database record by slug (includes UUID id)
 */
export async function getLayoutDBBySlug(slug: string): Promise<LayoutDB | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("layouts")
    .select(`
      *,
      layout_zones (*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  return data as LayoutDB
}

/**
 * Get all layouts as database records (includes UUID ids)
 * Used by admin UI
 */
export async function getLayoutsDB(): Promise<LayoutDB[]> {
  const supabase = await createClient()

  const { data: layouts, error } = await supabase
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

  return layouts as LayoutDB[]
}

/**
 * Get layout zones for a given layout
 */
export async function getLayoutZones(layoutSlug: string): Promise<LayoutZone[]> {
  const layout = await getLayoutBySlug(layoutSlug)
  return layout?.zones || []
}
