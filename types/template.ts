// ============================================
// KEEPERS Template System Type Definitions
// ============================================

// ============================================
// DATABASE TYPES (from Supabase tables)
// ============================================

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
  layout_zones?: LayoutZoneDB[]
}

export interface LayoutZoneDB {
  id: string
  layout_id: string
  zone_index: number
  zone_type: "photo" | "text"
  position_x: number
  position_y: number
  width: number
  height: number
  created_at: string
  updated_at: string
}

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

export interface Template {
  id: string
  slug: string
  name: string
  description: string | null
  category_id: string | null
  category?: TemplateCategory | null
  thumbnail_url: string | null
  preview_images: string[]
  page_count: number
  is_featured: boolean
  is_premium: boolean
  is_active: boolean
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
  template_pages?: TemplatePage[]
}

export interface TemplatePage {
  id: string
  template_id: string
  page_number: number
  layout_id: string | null
  layout?: LayoutDB | null
  title: string | null
  created_at: string
  updated_at: string
  template_elements?: TemplateElement[]
}

export interface TemplateElement {
  id: string
  template_page_id: string
  type: 'text' | 'decoration'
  text_content: string | null
  font_family: string | null
  font_size: number | null
  font_color: string | null
  font_weight: string | null
  font_style: string | null
  text_align: string | null
  position_x: number
  position_y: number
  width: number
  height: number
  rotation: number
  z_index: number
  created_at: string
  updated_at: string
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
  name: string
  description?: string
  category_id?: string
  thumbnail_url?: string
  pages: Array<{
    page_number: number
    layout_slug: string
    title?: string
  }>
}

export interface UpdateTemplateInput {
  name?: string
  description?: string
  category_id?: string | null
  thumbnail_url?: string | null
  preview_images?: string[]
  is_featured?: boolean
  is_premium?: boolean
  is_active?: boolean
  sort_order?: number
}

export interface CreateTemplatePageInput {
  template_id: string
  page_number: number
  layout_id?: string
  title?: string
}

export interface UpdateTemplatePageInput {
  layout_id?: string | null
  title?: string | null
}

export interface CreateTemplateElementInput {
  template_page_id: string
  type: 'text' | 'decoration'
  text_content?: string
  font_family?: string
  font_size?: number
  font_color?: string
  font_weight?: string
  font_style?: string
  text_align?: string
  position_x: number
  position_y: number
  width: number
  height: number
  rotation?: number
  z_index?: number
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
