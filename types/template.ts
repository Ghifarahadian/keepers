// ============================================
// KEEPERS Template & Layout Type Definitions
// ============================================
// This file contains:
// - Template types (Template, TemplateDB)
// - Layout system types (LayoutDB, LayoutZoneDB)
// - Template category types (TemplateCategory)
// - Admin types (AdminProfile)

// ============================================
// DATABASE TYPES (from Supabase tables)
// ============================================

import type { Zone, Page, PaperSize, PageCount } from './editor'

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
// TEMPLATE TYPES
// ============================================
// Templates are now separate from projects (admin-managed blueprints)

export interface Template {
  id: string
  slug: string
  title: string
  description: string | null
  category_id: string | null
  category?: TemplateCategory | null // Joined from template_categories
  project_id: string | null // 1-1 mapping to projects table
  thumbnail_url: string | null
  preview_images: string[] | null // JSONB array
  is_featured: boolean
  is_premium: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  pages?: Page[] // Optional: pages from template project (mapped from template_project.pages)
}

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

export interface CreateTemplateInput {
  slug: string
  title: string
  description?: string
  category_id?: string
  project_id: string // Required: the template project to copy from
  thumbnail_url?: string
  preview_images?: string[]
  is_featured?: boolean
  is_premium?: boolean
}

export interface UpdateTemplateInput {
  title?: string
  description?: string
  category_id?: string
  project_id?: string
  thumbnail_url?: string
  preview_images?: string[]
  is_featured?: boolean
  is_premium?: boolean
  is_active?: boolean
}

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
  user_id: string
  title: string
  cover_photo_url: string | null
  status: 'draft' | 'processed' | 'shipped' | 'completed'

  // Product configuration
  page_count: PageCount | null
  paper_size: PaperSize | null

  // Voucher
  voucher_code: string | null

  // Metadata
  last_edited_at: string
  created_at: string
  updated_at: string

  // Joined user profile data
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
  }
}
