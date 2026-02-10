// ============================================
// KEEPERS Photobook Editor Type Definitions
// ============================================

// Paper size options (centralized)
export type PaperSize = 'A4' | 'A5' | 'PDF Only'

// Page count options (centralized)
export type PageCount = 30 | 40

// Project status options (centralized)
export type ProjectStatus = 'draft' | 'processed' | 'shipped' | 'completed'

// Element/Zone type options (centralized)
export type ElementType = 'photo' | 'text'

// Font styling options (centralized)
export type FontWeight = 'normal' | 'bold' | 'light'
export type FontStyle = 'normal' | 'italic'
export type TextAlign = 'left' | 'center' | 'right'
export type TextDecoration = 'none' | 'underline'

export interface Project {
  id: string
  user_id: string
  title: string
  cover_photo_url?: string | null
  status: ProjectStatus

  // Product configuration
  page_count?: PageCount | null
  paper_size?: PaperSize | null

  // Voucher
  voucher_code?: string | null

  // Metadata
  last_edited_at: string
  created_at: string
  updated_at: string
  pages?: Page[]
}

export interface Page {
  id: string
  project_id: string // Pages always belong to a project
  page_number: number
  title?: string | null
  layout_slug?: string | null // Reference to layout used (informational only, no FK)
  created_at: string
  updated_at: string
  zones?: Zone[]
}

// Unified zone type - can belong to either a page OR a layout
export interface Zone {
  id: string
  page_id: string | null // Set if this is a page zone, NULL if layout zone
  layout_id: string | null // Set if this is a layout zone, NULL if page zone
  zone_index: number
  position_x: number // Position as percentage (0-100)
  position_y: number // Position as percentage (0-100)
  width: number // Size as percentage (0-100)
  height: number // Size as percentage (0-100)
  zone_type?: ElementType | null // Optional type hint (photo/text)
  created_at: string
  updated_at: string
}

// Alias for backwards compatibility - page zones are just zones with page_id set
export type PageZone = Zone

export interface Element {
  id: string
  zone_id: string // Foreign key to zones table
  type: ElementType

  // Photo fields
  photo_url?: string | null
  photo_storage_path?: string | null

  // Text fields
  text_content?: string | null
  font_family?: string | null
  font_size?: number | null
  font_color?: string | null
  font_weight?: FontWeight | null
  font_style?: FontStyle | null
  text_align?: TextAlign | null
  text_decoration?: TextDecoration | null

  // Position/size RELATIVE TO ZONE (for cropping/zooming)
  // - Can be negative (panned/offset from zone)
  // - Can exceed 100% (zoomed in/cropped)
  position_x: number
  position_y: number
  width: number
  height: number
  rotation: number

  created_at: string
  updated_at: string
}

export interface UploadedPhoto {
  id: string
  url: string
  path: string
  filename: string
  uploaded_at: string
}

// Layout templates for creating zones
export interface Layout {
  id: string
  name: string
  description: string
  icon?: string
  zones: Zone[] // Now uses unified Zone type instead of LayoutZone
}

// Legacy type alias - layout zones are now just zones with layout_id set
export type LayoutZone = Zone

// ============================================
// EDITOR STATE TYPES
// ============================================

export interface EditorState {
  project: Project
  pages: Page[]
  currentSpreadIndex: number // Index of current spread (0 = pages 0-1, 1 = pages 2-3, etc.)
  activePageSide: 'left' | 'right' // Which page in the spread is active for editing
  zones: Record<string, Zone[]> // Keyed by pageId (only page zones, layout zones not stored here)
  elements: Record<string, Element[]> // Keyed by zoneId (elements now belong to zones)
  uploadedPhotos: UploadedPhoto[]
  selectedElementId: string | null
  selectedZoneId: string | null // For selecting empty zones
  isSaving: boolean
  lastSaved: string | null
  error: string | null
  isDragging: boolean // True while dragging/resizing an element
  isDraggingZone: boolean // True while dragging/resizing a zone
}

export type EditorAction =
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'SET_PAGES'; payload: Page[] }
  | { type: 'SET_CURRENT_SPREAD'; payload: number }
  | { type: 'SET_ACTIVE_PAGE_SIDE'; payload: 'left' | 'right' }
  | { type: 'UPDATE_PROJECT_TITLE'; payload: string }
  | { type: 'ADD_PAGE'; payload: Page }
  | { type: 'DELETE_PAGE'; payload: string }
  | { type: 'REORDER_PAGES'; payload: Page[] }
  | { type: 'SET_ZONES'; payload: { pageId: string; zones: Zone[] } }
  | { type: 'UPDATE_ZONE'; payload: { pageId: string; zoneId: string; updates: Partial<Zone> } }
  | { type: 'SET_ELEMENTS'; payload: { zoneId: string; elements: Element[] } }
  | { type: 'ADD_ELEMENT'; payload: { zoneId: string; element: Element } }
  | { type: 'UPDATE_ELEMENT'; payload: { zoneId: string; elementId: string; updates: Partial<Element> } }
  | { type: 'DELETE_ELEMENT'; payload: { zoneId: string; elementId: string } }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'SELECT_ZONE'; payload: string | null }
  | { type: 'ADD_UPLOADED_PHOTO'; payload: UploadedPhoto }
  | { type: 'REMOVE_UPLOADED_PHOTO'; payload: string }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_DRAGGING_ZONE'; payload: boolean }

// ============================================
// FORM TYPES
// ============================================

export interface CreateProjectInput {
  title?: string
  page_count?: PageCount
  paper_size?: PaperSize
  voucher_code?: string
}

export interface UpdateProjectInput {
  title?: string
  cover_photo_url?: string
  status?: ProjectStatus
  page_count?: PageCount
  paper_size?: PaperSize
  voucher_code?: string | null
}

export interface CreatePageInput {
  project_id: string // Pages always belong to a project
  page_number: number
  title?: string
  layout_slug?: string // Optional: which layout was used
}

export interface UpdatePageInput {
  title?: string
  layout_slug?: string // Optional: update which layout is being used
}

export interface CreateZoneInput {
  page_id?: string // Required if creating page zone
  layout_id?: string // Required if creating layout zone
  zone_index: number
  position_x: number
  position_y: number
  width: number
  height: number
  zone_type?: ElementType // Optional type hint
}

export interface UpdateZoneInput {
  position_x?: number
  position_y?: number
  width?: number
  height?: number
}

export interface CreateElementInput {
  zone_id: string // Foreign key to zones table
  type: ElementType
  photo_url?: string
  photo_storage_path?: string
  text_content?: string
  font_family?: string
  font_size?: number
  font_color?: string
  font_weight?: FontWeight
  font_style?: FontStyle
  text_align?: TextAlign
  text_decoration?: TextDecoration
  position_x: number // Position relative to zone
  position_y: number // Position relative to zone
  width: number // Width relative to zone
  height: number // Height relative to zone
  rotation?: number
}

export interface UpdateElementInput {
  zone_id?: string // Optional: Update zone assignment
  photo_url?: string | null
  photo_storage_path?: string | null
  text_content?: string | null
  font_family?: string | null
  font_size?: number | null
  font_color?: string | null
  font_weight?: FontWeight | null
  font_style?: FontStyle | null
  text_align?: TextAlign | null
  text_decoration?: TextDecoration | null
  position_x?: number // Position relative to zone
  position_y?: number // Position relative to zone
  width?: number // Width relative to zone
  height?: number // Height relative to zone
  rotation?: number
}

// ============================================
// UTILITY TYPES
// ============================================

export interface DragData {
  type: 'photo' | 'element'
  photo?: UploadedPhoto
  element?: Element
}

export interface DropPosition {
  x: number
  y: number
}

export interface CanvasSize {
  width: number
  height: number
}
