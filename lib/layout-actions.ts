"use server"

import type { Layout, LayoutZone } from "@/types/editor"
import type { LayoutDB } from "@/types/template"
import {
  fetchAllActiveLayoutsWithZones,
  fetchAllLayoutsWithZones,
  fetchLayoutBySlugWithZones,
  fetchLayoutDBBySlugWithZones,
  fetchLayoutZones,
} from "@/lib/zone-queries"

// ============================================
// LAYOUT ACTIONS (Public - for editor)
// ============================================

/**
 * Get all active layouts from the database
 * Returns layouts in the same format as the static LAYOUTS array for backward compatibility
 */
export async function getLayouts(): Promise<Layout[]> {
  return fetchAllActiveLayoutsWithZones()
}

/**
 * Get a single layout by slug
 */
export async function getLayoutBySlug(slug: string): Promise<Layout | null> {
  return fetchLayoutBySlugWithZones(slug)
}

/**
 * Get layout database record by slug (includes UUID id)
 */
export async function getLayoutDBBySlug(slug: string): Promise<LayoutDB | null> {
  return fetchLayoutDBBySlugWithZones(slug)
}

/**
 * Get all layouts as database records (includes UUID ids)
 * Used by admin UI
 */
export async function getLayoutsDB(): Promise<LayoutDB[]> {
  return fetchAllLayoutsWithZones()
}

/**
 * Get layout zones for a given layout
 */
export async function getLayoutZones(layoutSlug: string): Promise<LayoutZone[]> {
  return fetchLayoutZones(layoutSlug)
}
