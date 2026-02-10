import type { Zone, CreateZoneInput, ElementType } from "@/types/editor"

// ============================================
// ZONE VALIDATION UTILITIES
// ============================================

export interface ZoneValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate zone input before creation or update
 * Checks position, size, and required fields
 */
export function validateZoneInput(zone: Partial<Zone> | CreateZoneInput): ZoneValidationResult {
  const errors: string[] = []

  // Check parent reference ONLY if parent fields are present (for create operations)
  // For update operations, these fields won't be present and that's OK
  const hasLayoutIdKey = 'layout_id' in zone
  const hasPageIdKey = 'page_id' in zone

  if (hasLayoutIdKey || hasPageIdKey) {
    // Parent reference validation only applies when these keys are present
    const hasLayoutId = zone.layout_id != null
    const hasPageId = zone.page_id != null

    if (!hasLayoutId && !hasPageId) {
      errors.push("Zone must belong to either a layout or a page (layout_id or page_id required)")
    }

    if (hasLayoutId && hasPageId) {
      errors.push("Zone cannot belong to both a layout and a page (only one of layout_id or page_id allowed)")
    }
  }

  // Validate position and size bounds (0-100 percentage)
  if (zone.position_x !== undefined) {
    if (!validateZoneBounds(zone.position_x)) {
      errors.push("position_x must be between 0 and 100")
    }
  }

  if (zone.position_y !== undefined) {
    if (!validateZoneBounds(zone.position_y)) {
      errors.push("position_y must be between 0 and 100")
    }
  }

  if (zone.width !== undefined) {
    if (!validateZoneBounds(zone.width)) {
      errors.push("width must be between 0 and 100")
    }
    // Check minimum zone width (5%)
    if (zone.width < 5) {
      errors.push("width must be at least 5%")
    }
  }

  if (zone.height !== undefined) {
    if (!validateZoneBounds(zone.height)) {
      errors.push("height must be between 0 and 100")
    }
    // Check minimum zone height (5%)
    if (zone.height < 5) {
      errors.push("height must be at least 5%")
    }
  }

  // Validate zone_index if provided
  if ('zone_index' in zone && zone.zone_index !== undefined) {
    if (zone.zone_index < 0) {
      errors.push("zone_index must be non-negative")
    }
  }

  // Validate zone_type if provided
  if (zone.zone_type !== undefined && zone.zone_type !== null) {
    if (zone.zone_type !== 'photo' && zone.zone_type !== 'text') {
      errors.push("zone_type must be 'photo' or 'text'")
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate that a value is within the 0-100 percentage bounds
 */
export function validateZoneBounds(value: number): boolean {
  return value >= 0 && value <= 100
}

/**
 * Validate that zone fits within canvas (no overflow)
 */
export function validateZoneFitsCanvas(
  position_x: number,
  position_y: number,
  width: number,
  height: number
): ZoneValidationResult {
  const errors: string[] = []

  if (position_x + width > 100) {
    errors.push("Zone overflows right edge of canvas")
  }

  if (position_y + height > 100) {
    errors.push("Zone overflows bottom edge of canvas")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate zone type and normalize to valid value
 */
export function normalizeZoneType(zone_type?: string | null): ElementType {
  if (zone_type === 'text') return 'text'
  return 'photo' // Default to photo
}
