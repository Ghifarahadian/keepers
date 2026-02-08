"use server"

import { createClient } from "@/lib/supabase/server"
import type { Layout, LayoutZone, Zone } from "@/types/editor"
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
      zones!zones_layout_id_fkey (*)
    `)
    .eq("is_active", true)
    .order("sort_order")

  if (error) {
    console.error("Error fetching layouts:", error)
    return []
  }

  // Transform to Layout format (using slug as id for backward compatibility)
  return layouts.map((l: LayoutDB) => ({
    id: l.slug, // Use slug as ID for backward compatibility with existing pages
    name: l.name,
    description: l.description || "",
    icon: l.icon || undefined,
    zones: (l.zones || [])
      .sort((a, b) => a.zone_index - b.zone_index)
      .map((z: Zone) => ({
        ...z,
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
      zones!zones_layout_id_fkey (*)
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
    zones: (data.zones || [])
      .sort((a: Zone, b: Zone) => a.zone_index - b.zone_index)
      .map((z: Zone) => ({
        ...z,
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
      zones!zones_layout_id_fkey (*)
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
      zones!zones_layout_id_fkey (*)
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
