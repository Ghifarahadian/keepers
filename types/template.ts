// ============================================
// KEEPERS Layout & Category Type Definitions
// ============================================
// NOTE: Templates have been merged into the Project type (see types/editor.ts)
// This file now contains:
// - Layout system types (LayoutDB, LayoutZoneDB)
// - Template category types (TemplateCategory)
// - Admin types (AdminProject, AdminProfile)

// ============================================
// DATABASE TYPES (from Supabase tables)
// ============================================

import type { Zone } from './editor'

export interface LayoutDB {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  thumbnail_url: string | null
  is_system: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  zones?: Zone[] // Now uses unified Zone type (zones with layout_id set)
}

// Legacy type alias - layout zones are now just zones with layout_id set
// This is kept for backwards compatibility
export type LayoutZoneDB = Zone

export interface TemplateCategory {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================
// NOTE: Templates have been merged into Project type
// ============================================
// Templates are now projects with is_template=TRUE
// See types/editor.ts for the unified Project interface
// Template pages are now pages with is_template=TRUE
// See types/editor.ts for the unified Page interface

// ============================================
// INPUT TYPES (for creating/updating)
// ============================================

export interface CreateLayoutInput {
  slug: string
  name: string
  description?: string
  icon?: string
  zones: Array<{
    position_x: number
    position_y: number
    width: number
    height: number
    zone_type: "photo" | "text"
  }>
}

export interface UpdateLayoutInput {
  name?: string
  description?: string
  icon?: string
  thumbnail_url?: string
  is_active?: boolean
  sort_order?: number
  zones?: Array<{
    position_x: number
    position_y: number
    width: number
    height: number
    zone_type: "photo" | "text"
  }>
}

export interface CreateTemplateCategoryInput {
  slug: string
  name: string
  description?: string
  icon?: string
}

export interface UpdateTemplateCategoryInput {
  name?: string
  description?: string
  icon?: string
  is_active?: boolean
  sort_order?: number
}

// ============================================
// NOTE: Template input types removed
// ============================================
// Use CreateProjectInput with is_template=true for creating templates
// Use UpdateProjectInput for updating templates
// Use CreatePageInput with is_template=true for template pages
// Use UpdatePageInput for updating template pages
// See types/editor.ts for these input types

// ============================================
// ADMIN TYPES
// ============================================

export interface AdminProfile {
  id: string
  first_name: string | null
  last_name: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface AdminProject {
  // Core fields
  id: string
  user_id: string | null // NULL for templates
  title: string
  cover_photo_url: string | null
  status: 'draft' | 'processed' | 'shipped' | 'completed'

  // Template/Project distinction
  is_template: boolean

  // Template-specific fields (NULL for user projects)
  slug?: string | null
  description?: string | null
  category_id?: string | null
  category?: { id: string; slug: string; name: string; description?: string | null } | null // Joined from template_categories
  thumbnail_url?: string | null
  preview_images?: string[] | null
  is_featured?: boolean
  is_premium?: boolean
  is_active?: boolean

  // Product configuration
  page_count: number | null
  paper_size: string | null

  // Voucher (projects only)
  voucher_code: string | null

  // Metadata
  last_edited_at: string
  created_at: string
  updated_at: string

  // Joined user profile data (NULL for templates)
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
  } | null
}
