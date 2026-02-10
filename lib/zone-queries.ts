"use server"

import { createClient } from "@/lib/supabase/server"
import type { Layout, Zone } from "@/types/editor"
import type { LayoutDB } from "@/types/template"

// ============================================
// SHARED ZONE QUERY UTILITIES
// ============================================

/**
 * Fetch all active layouts with zones (for public/editor use)
 * Returns layouts in the Legacy format (slug as id)
 */
export async function fetchAllActiveLayoutsWithZones(): Promise<Layout[]> {
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
 * Fetch all layouts with zones (for admin use, includes inactive)
 * Returns layouts as database records with UUID ids
 */
export async function fetchAllLayoutsWithZones(): Promise<LayoutDB[]> {
  const supabase = await createClient()

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
 * Fetch a single layout by slug with zones (active only)
 * Returns layout in legacy format (slug as id)
 */
export async function fetchLayoutBySlugWithZones(slug: string): Promise<Layout | null> {
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
 * Fetch layout database record by slug with zones (active only)
 * Returns layout as database record with UUID id
 */
export async function fetchLayoutDBBySlugWithZones(slug: string): Promise<LayoutDB | null> {
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
 * Fetch layout by UUID with zones (for admin use)
 * Returns layout as database record with UUID id
 */
export async function fetchLayoutByIdWithZones(layoutId: string): Promise<LayoutDB | null> {
  const supabase = await createClient()

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
 * Fetch layout zones only (no layout metadata)
 * Returns sorted array of zones for a given layout slug
 */
export async function fetchLayoutZones(layoutSlug: string): Promise<Zone[]> {
  const layout = await fetchLayoutBySlugWithZones(layoutSlug)
  return layout?.zones || []
}

/**
 * Fetch page zones with optional elements
 * Returns zones for a given page ID
 */
export async function fetchPageZones(pageId: string): Promise<Zone[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("zones")
    .select("*")
    .eq("page_id", pageId)
    .order("zone_index")

  if (error) {
    console.error("Error fetching page zones:", error)
    return []
  }

  return data as Zone[]
}

/**
 * Fetch page zones with elements attached
 * Returns zones with their elements for rendering
 */
export async function fetchPageZonesWithElements(pageId: string): Promise<Zone[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("zones")
    .select(`
      *,
      elements (*)
    `)
    .eq("page_id", pageId)
    .order("zone_index")

  if (error) {
    console.error("Error fetching page zones with elements:", error)
    return []
  }

  return data as Zone[]
}
