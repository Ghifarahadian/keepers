"use server"

import { createClient } from "@/lib/supabase/server"
import type { Zone, CreateZoneInput, UpdateZoneInput, ElementType } from "@/types/editor"
import { validateZoneInput, normalizeZoneType } from "@/lib/zone-validation"

// ============================================
// SHARED ZONE OPERATION UTILITIES
// ============================================

export interface CreateZonesInput {
  parentType: 'layout' | 'page'
  parentId: string
  zones: Array<{
    zone_index: number
    zone_type?: ElementType | null
    position_x: number
    position_y: number
    width: number
    height: number
  }>
}

/**
 * Create multiple zones for a layout or page
 * Used by: layout creation, template page creation
 */
export async function createZones(input: CreateZonesInput): Promise<Zone[]> {
  const supabase = await createClient()

  if (input.zones.length === 0) {
    return []
  }

  // Prepare zone records
  const zonesToInsert = input.zones.map((z, i) => {
    const zoneRecord = {
      layout_id: input.parentType === 'layout' ? input.parentId : null,
      page_id: input.parentType === 'page' ? input.parentId : null,
      zone_index: z.zone_index ?? i, // Use provided index or fallback to array index
      zone_type: normalizeZoneType(z.zone_type),
      position_x: z.position_x,
      position_y: z.position_y,
      width: z.width,
      height: z.height,
    }

    // Validate zone input
    const validation = validateZoneInput(zoneRecord)
    if (!validation.valid) {
      throw new Error(`Invalid zone at index ${i}: ${validation.errors.join(', ')}`)
    }

    return zoneRecord
  })

  // Insert zones
  const { data, error } = await supabase
    .from("zones")
    .insert(zonesToInsert)
    .select()

  if (error) {
    console.error("Error creating zones:", error)
    throw error
  }

  return data as Zone[]
}

/**
 * Create a single zone for a layout or page
 * Used by: editor zone creation
 */
export async function createZone(input: CreateZoneInput): Promise<Zone> {
  const supabase = await createClient()

  // Validate that exactly one of layout_id or page_id is provided
  const hasLayoutId = input.layout_id !== undefined && input.layout_id !== null
  const hasPageId = input.page_id !== undefined && input.page_id !== null

  if (!hasLayoutId && !hasPageId) {
    throw new Error("Either page_id or layout_id must be provided")
  }

  if (hasLayoutId && hasPageId) {
    throw new Error("Cannot provide both page_id and layout_id")
  }

  // Validate zone input
  const validation = validateZoneInput(input)
  if (!validation.valid) {
    throw new Error(`Invalid zone: ${validation.errors.join(', ')}`)
  }

  // Create zone in unified zones table
  const { data: zone, error } = await supabase
    .from("zones")
    .insert({
      layout_id: input.layout_id || null,
      page_id: input.page_id || null,
      zone_index: input.zone_index,
      zone_type: normalizeZoneType(input.zone_type),
      position_x: input.position_x,
      position_y: input.position_y,
      width: input.width,
      height: input.height,
    })
    .select()
    .single()

  if (error) throw error
  return zone as Zone
}

/**
 * Update a zone's position or size
 * Works for both layout zones and page zones
 */
export async function updateZone(
  zoneId: string,
  updates: UpdateZoneInput
): Promise<Zone> {
  const supabase = await createClient()

  // Validate update input
  if (Object.keys(updates).length > 0) {
    const validation = validateZoneInput(updates)
    if (!validation.valid) {
      throw new Error(`Invalid zone update: ${validation.errors.join(', ')}`)
    }
  }

  const { data, error } = await supabase
    .from("zones")
    .update(updates)
    .eq("id", zoneId)
    .select()
    .single()

  if (error) throw error
  return data as Zone
}

/**
 * Copy zones from source zones to a new parent (layout or page)
 * Used by: template application, layout duplication
 */
export async function copyZones(
  sourceZones: Zone[],
  targetType: 'layout' | 'page',
  targetId: string
): Promise<Zone[]> {
  if (sourceZones.length === 0) {
    return []
  }

  const zonesInput: CreateZonesInput = {
    parentType: targetType,
    parentId: targetId,
    zones: sourceZones.map((zone) => ({
      zone_index: zone.zone_index,
      zone_type: zone.zone_type || 'photo',
      position_x: zone.position_x,
      position_y: zone.position_y,
      width: zone.width,
      height: zone.height,
    })),
  }

  return createZones(zonesInput)
}

/**
 * Delete a zone and its elements (cascade handled by database)
 */
export async function deleteZone(zoneId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("zones")
    .delete()
    .eq("id", zoneId)

  if (error) throw error
}

/**
 * Delete all zones for a given parent (layout or page)
 */
export async function deleteZonesForParent(
  parentType: 'layout' | 'page',
  parentId: string
): Promise<void> {
  const supabase = await createClient()

  const column = parentType === 'layout' ? 'layout_id' : 'page_id'

  const { error } = await supabase
    .from("zones")
    .delete()
    .eq(column, parentId)

  if (error) throw error
}
