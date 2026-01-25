// ============================================
// KEEPERS Photobook Editor Type Definitions
// ============================================

export interface Project {
  id: string
  user_id: string
  title: string
  cover_photo_url?: string | null
  status: 'draft' | 'completed' | 'archived'
  last_edited_at: string
  created_at: string
  updated_at: string
  pages?: Page[]
}

export interface Page {
  id: string
  project_id: string
  page_number: number
  layout_id: string
  title?: string | null
  created_at: string
  updated_at: string
  elements?: Element[]
}

export interface Element {
  id: string
  page_id: string
  type: 'photo' | 'text'

  // Photo fields
  photo_url?: string | null
  photo_storage_path?: string | null

  // Text fields
  text_content?: string | null
  font_family?: string | null
  font_size?: number | null
  font_color?: string | null
  font_weight?: 'normal' | 'bold' | 'light' | null
  font_style?: 'normal' | 'italic' | null
  text_align?: 'left' | 'center' | 'right' | null
  text_decoration?: 'none' | 'underline' | null

  // Layout positioning (percentages 0-100)
  position_x: number
  position_y: number
  width: number
  height: number
  rotation: number
  z_index: number

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

// Layout templates for creating elements
export interface Layout {
  id: string
  name: string
  description: string
  icon?: string
  zones: LayoutZone[]
}

export interface LayoutZone {
  position_x: number
  position_y: number
  width: number
  height: number
}

// ============================================
// PRE-DEFINED LAYOUTS
// ============================================

export const LAYOUTS: Layout[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty page with no photo zones',
    zones: []
  },
  {
    id: 'single',
    name: 'Single',
    description: 'One large photo centered',
    zones: [
      { position_x: 10, position_y: 10, width: 80, height: 80 }
    ]
  },
  {
    id: 'double',
    name: 'Double',
    description: 'Two photos side by side',
    zones: [
      { position_x: 5, position_y: 10, width: 42.5, height: 80 },
      { position_x: 52.5, position_y: 10, width: 42.5, height: 80 }
    ]
  },
  {
    id: 'triple',
    name: 'Triple',
    description: 'One large photo with two smaller ones',
    zones: [
      { position_x: 5, position_y: 10, width: 60, height: 80 },
      { position_x: 70, position_y: 10, width: 25, height: 37.5 },
      { position_x: 70, position_y: 52.5, width: 25, height: 37.5 }
    ]
  },
  {
    id: 'grid-4',
    name: 'Grid 4',
    description: '2x2 grid of equal photos',
    zones: [
      { position_x: 5, position_y: 5, width: 42.5, height: 42.5 },
      { position_x: 52.5, position_y: 5, width: 42.5, height: 42.5 },
      { position_x: 5, position_y: 52.5, width: 42.5, height: 42.5 },
      { position_x: 52.5, position_y: 52.5, width: 42.5, height: 42.5 }
    ]
  },
  {
    id: 'grid-6',
    name: 'Grid 6',
    description: '2x3 grid of equal photos',
    zones: [
      { position_x: 5, position_y: 3, width: 42.5, height: 28 },
      { position_x: 52.5, position_y: 3, width: 42.5, height: 28 },
      { position_x: 5, position_y: 36, width: 42.5, height: 28 },
      { position_x: 52.5, position_y: 36, width: 42.5, height: 28 },
      { position_x: 5, position_y: 69, width: 42.5, height: 28 },
      { position_x: 52.5, position_y: 69, width: 42.5, height: 28 }
    ]
  }
]

// ============================================
// EDITOR STATE TYPES
// ============================================

export interface EditorState {
  project: Project
  pages: Page[]
  currentSpreadIndex: number // Index of current spread (0 = pages 0-1, 1 = pages 2-3, etc.)
  activePageSide: 'left' | 'right' // Which page in the spread is active for editing
  elements: Record<string, Element[]> // Keyed by pageId
  uploadedPhotos: UploadedPhoto[]
  selectedElementId: string | null
  isSaving: boolean
  lastSaved: string | null
  error: string | null
  isDragging: boolean // True while dragging/resizing an element
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
  | { type: 'UPDATE_PAGE_LAYOUT'; payload: { pageId: string; layoutId: string } }
  | { type: 'SET_ELEMENTS'; payload: { pageId: string; elements: Element[] } }
  | { type: 'ADD_ELEMENT'; payload: { pageId: string; element: Element } }
  | { type: 'UPDATE_ELEMENT'; payload: { pageId: string; elementId: string; updates: Partial<Element> } }
  | { type: 'DELETE_ELEMENT'; payload: { pageId: string; elementId: string } }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'ADD_UPLOADED_PHOTO'; payload: UploadedPhoto }
  | { type: 'REMOVE_UPLOADED_PHOTO'; payload: string }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DRAGGING'; payload: boolean }

// ============================================
// FORM TYPES
// ============================================

export interface CreateProjectInput {
  title?: string
}

export interface UpdateProjectInput {
  title?: string
  cover_photo_url?: string
  status?: 'draft' | 'completed' | 'archived'
}

export interface CreatePageInput {
  project_id: string
  page_number: number
  layout_id?: string
  title?: string
}

export interface UpdatePageInput {
  layout_id?: string
  title?: string
}

export interface CreateElementInput {
  page_id: string
  type: 'photo' | 'text'
  photo_url?: string
  photo_storage_path?: string
  text_content?: string
  font_family?: string
  font_size?: number
  font_color?: string
  font_weight?: 'normal' | 'bold' | 'light'
  font_style?: 'normal' | 'italic'
  text_align?: 'left' | 'center' | 'right'
  text_decoration?: 'none' | 'underline'
  position_x: number
  position_y: number
  width: number
  height: number
  rotation?: number
  z_index?: number
}

export interface UpdateElementInput {
  photo_url?: string | null
  photo_storage_path?: string | null
  text_content?: string | null
  font_family?: string | null
  font_size?: number | null
  font_color?: string | null
  font_weight?: 'normal' | 'bold' | 'light' | null
  font_style?: 'normal' | 'italic' | null
  text_align?: 'left' | 'center' | 'right' | null
  text_decoration?: 'none' | 'underline' | null
  position_x?: number
  position_y?: number
  width?: number
  height?: number
  rotation?: number
  z_index?: number
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
