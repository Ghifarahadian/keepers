"use client"

import React, { createContext, useContext, useReducer, useCallback } from "react"
import type { Project, Page, Element, EditorState, EditorAction, UploadedPhoto, UpdateElementInput } from "@/types/editor"
import { updateProject, updateElement, createElement, deleteElement } from "@/lib/editor-actions"

// Initial state
const createInitialState = (project: Project, uploadedPhotos?: UploadedPhoto[]): EditorState => ({
  project,
  pages: project.pages || [],
  currentSpreadIndex: 0, // Start at first spread (pages 0-1)
  activePageSide: 'right', // Default to right page (front cover on first spread)
  elements: project.pages?.reduce((acc, page) => {
    acc[page.id] = page.elements || []
    return acc
  }, {} as Record<string, Element[]>) || {},
  uploadedPhotos: uploadedPhotos || [],
  selectedElementId: null,
  isSaving: false,
  lastSaved: null,
  error: null,
  isDragging: false,
})

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_PROJECT":
      return { ...state, project: action.payload }

    case "SET_PAGES":
      return { ...state, pages: action.payload }

    case "SET_CURRENT_SPREAD":
      return { ...state, currentSpreadIndex: action.payload, selectedElementId: null }

    case "SET_ACTIVE_PAGE_SIDE":
      return { ...state, activePageSide: action.payload }

    case "UPDATE_PROJECT_TITLE":
      return {
        ...state,
        project: { ...state.project, title: action.payload },
      }

    case "ADD_PAGE":
      return {
        ...state,
        pages: [...state.pages, action.payload],
        elements: { ...state.elements, [action.payload.id]: [] },
      }

    case "DELETE_PAGE": {
      const newPages = state.pages.filter((p) => p.id !== action.payload)
      const newElements = { ...state.elements }
      delete newElements[action.payload]
      // Adjust spread index if it would be out of bounds
      const maxSpreadIndex = Math.max(0, Math.floor((newPages.length - 1) / 2))
      const newSpreadIndex = Math.min(state.currentSpreadIndex, maxSpreadIndex)
      return {
        ...state,
        pages: newPages,
        elements: newElements,
        currentSpreadIndex: newSpreadIndex,
      }
    }

    case "REORDER_PAGES":
      return { ...state, pages: action.payload }

    case "UPDATE_PAGE_LAYOUT": {
      const newPages = state.pages.map((p) =>
        p.id === action.payload.pageId ? { ...p, layout_id: action.payload.layoutId } : p
      )
      return { ...state, pages: newPages }
    }

    case "SET_ELEMENTS":
      return {
        ...state,
        elements: { ...state.elements, [action.payload.pageId]: action.payload.elements },
      }

    case "ADD_ELEMENT": {
      const currentElements = state.elements[action.payload.pageId] || []
      return {
        ...state,
        elements: {
          ...state.elements,
          [action.payload.pageId]: [...currentElements, action.payload.element],
        },
      }
    }

    case "UPDATE_ELEMENT": {
      const { pageId, elementId, updates } = action.payload
      const pageElements = state.elements[pageId]
      if (!pageElements) return state

      return {
        ...state,
        elements: {
          ...state.elements,
          [pageId]: pageElements.map((el) =>
            el.id === elementId ? { ...el, ...updates } : el
          ),
        },
      }
    }

    case "DELETE_ELEMENT": {
      const { pageId, elementId } = action.payload
      const pageElements = state.elements[pageId]
      if (!pageElements) return state

      return {
        ...state,
        elements: {
          ...state.elements,
          [pageId]: pageElements.filter((el) => el.id !== elementId),
        },
        selectedElementId: state.selectedElementId === elementId ? null : state.selectedElementId,
      }
    }

    case "SELECT_ELEMENT":
      return { ...state, selectedElementId: action.payload }

    case "ADD_UPLOADED_PHOTO":
      return {
        ...state,
        uploadedPhotos: [...state.uploadedPhotos, action.payload],
      }

    case "REMOVE_UPLOADED_PHOTO":
      return {
        ...state,
        uploadedPhotos: state.uploadedPhotos.filter((p) => p.id !== action.payload),
      }

    case "SET_SAVING":
      return { ...state, isSaving: action.payload }

    case "SET_LAST_SAVED":
      return { ...state, lastSaved: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "SET_DRAGGING":
      return { ...state, isDragging: action.payload }

    default:
      return state
  }
}

// Context type
interface EditorContextValue {
  state: EditorState
  dispatch: React.Dispatch<EditorAction>

  // Project actions
  updateProjectTitle: (title: string) => void
  saveProject: () => Promise<void>

  // Spread actions
  setCurrentSpread: (spreadIndex: number) => void
  getCurrentSpreadPages: () => [Page | null, Page | null]
  setActivePageSide: (side: 'left' | 'right') => void
  getActivePage: () => Page | null

  // Element actions
  addElementToCanvas: (pageId: string, element: Omit<Element, "id" | "created_at" | "updated_at">) => Promise<void>
  updateElementLocal: (elementId: string, updates: UpdateElementInput) => void
  updateElementPosition: (elementId: string, updates: UpdateElementInput) => Promise<void>
  deleteElementFromCanvas: (elementId: string) => Promise<void>
  selectElement: (elementId: string | null) => void
  setDragging: (isDragging: boolean) => void

  // Photo actions
  addUploadedPhoto: (photo: UploadedPhoto) => void
  removeUploadedPhoto: (photoId: string) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

// Provider
export function EditorProvider({
  children,
  initialProject,
  initialUploadedPhotos,
}: {
  children: React.ReactNode
  initialProject: Project
  initialUploadedPhotos?: UploadedPhoto[]
}) {
  const [state, dispatch] = useReducer(editorReducer, createInitialState(initialProject, initialUploadedPhotos))

  // Save project - defined before useEffect that uses it
  const saveProject = useCallback(async () => {
    if (state.isSaving) return // Prevent duplicate saves

    try {
      dispatch({ type: "SET_SAVING", payload: true })

      // Save project metadata
      await updateProject(state.project.id, {
        title: state.project.title,
      })

      dispatch({ type: "SET_LAST_SAVED", payload: new Date().toISOString() })
      dispatch({ type: "SET_ERROR", payload: null })
    } catch (error) {
      console.error("Save error:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to save project" })
    } finally {
      dispatch({ type: "SET_SAVING", payload: false })
    }
  }, [state.project.id, state.project.title, state.isSaving])


  // Update project title
  const updateProjectTitle = useCallback((title: string) => {
    dispatch({ type: "UPDATE_PROJECT_TITLE", payload: title })
  }, [])

  // Set current spread
  const setCurrentSpread = useCallback((spreadIndex: number) => {
    dispatch({ type: "SET_CURRENT_SPREAD", payload: spreadIndex })
  }, [])

  // Get current spread pages (left and right)
  const getCurrentSpreadPages = useCallback((): [Page | null, Page | null] => {
    const leftIndex = state.currentSpreadIndex * 2
    const rightIndex = leftIndex + 1
    const leftPage = state.pages[leftIndex] || null
    const rightPage = state.pages[rightIndex] || null
    return [leftPage, rightPage]
  }, [state.currentSpreadIndex, state.pages])

  // Set active page side within the spread
  const setActivePageSide = useCallback((side: 'left' | 'right') => {
    dispatch({ type: "SET_ACTIVE_PAGE_SIDE", payload: side })
  }, [])

  // Get the currently active page
  const getActivePage = useCallback((): Page | null => {
    const pageIndex = state.currentSpreadIndex * 2 + (state.activePageSide === 'left' ? 0 : 1)
    return state.pages[pageIndex] || null
  }, [state.currentSpreadIndex, state.activePageSide, state.pages])

  // Add element to canvas
  const addElementToCanvas = useCallback(
    async (pageId: string, element: Omit<Element, "id" | "created_at" | "updated_at">) => {
      try {
        const newElement = await createElement({
          page_id: pageId,
          type: element.type,
          photo_url: element.photo_url || undefined,
          photo_storage_path: element.photo_storage_path || undefined,
          position_x: element.position_x,
          position_y: element.position_y,
          width: element.width,
          height: element.height,
          rotation: element.rotation || 0,
          z_index: element.z_index || 0,
        })

        dispatch({ type: "ADD_ELEMENT", payload: { pageId, element: newElement } })
      } catch (error) {
        console.error("Add element error:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to add photo" })
      }
    },
    []
  )

  // Helper to find pageId for an element
  const findElementPageId = useCallback((elementId: string): string | null => {
    for (const [pageId, elements] of Object.entries(state.elements)) {
      if (elements.some(el => el.id === elementId)) {
        return pageId
      }
    }
    return null
  }, [state.elements])

  // Update element locally only (no server call) - for dragging/resizing
  const updateElementLocal = useCallback((elementId: string, updates: UpdateElementInput) => {
    const pageId = findElementPageId(elementId)
    if (!pageId) return
    dispatch({ type: "UPDATE_ELEMENT", payload: { pageId, elementId, updates } })
  }, [findElementPageId])

  // Update element position and save to server
  const updateElementPosition = useCallback(async (elementId: string, updates: UpdateElementInput) => {
    const pageId = findElementPageId(elementId)
    if (!pageId) return
    dispatch({ type: "UPDATE_ELEMENT", payload: { pageId, elementId, updates } })
    try {
      await updateElement(elementId, updates)
    } catch (error) {
      console.error("Update element error:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update photo" })
    }
  }, [findElementPageId])

  // Delete element
  const deleteElementFromCanvas = useCallback(async (elementId: string) => {
    const pageId = findElementPageId(elementId)
    if (!pageId) return
    try {
      await deleteElement(elementId)
      dispatch({ type: "DELETE_ELEMENT", payload: { pageId, elementId } })
    } catch (error) {
      console.error("Delete element error:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to delete photo" })
    }
  }, [findElementPageId])

  // Select element (and navigate to its page)
  const selectElement = useCallback((elementId: string | null) => {
    // If selecting an element, navigate to its page first
    if (elementId) {
      const pageId = findElementPageId(elementId)
      if (pageId) {
        const pageIndex = state.pages.findIndex(p => p.id === pageId)
        if (pageIndex !== -1) {
          const spreadIndex = Math.floor(pageIndex / 2)
          const pageSide = pageIndex % 2 === 0 ? 'left' : 'right'

          // Set spread and side before selecting (SET_CURRENT_SPREAD clears selection)
          if (spreadIndex !== state.currentSpreadIndex) {
            dispatch({ type: "SET_CURRENT_SPREAD", payload: spreadIndex })
          }
          if (pageSide !== state.activePageSide) {
            dispatch({ type: "SET_ACTIVE_PAGE_SIDE", payload: pageSide })
          }
        }
      }
    }

    // Select the element after navigation
    dispatch({ type: "SELECT_ELEMENT", payload: elementId })
  }, [findElementPageId, state.pages, state.currentSpreadIndex, state.activePageSide])

  // Set dragging state (for thumbnail optimization)
  const setDragging = useCallback((isDragging: boolean) => {
    dispatch({ type: "SET_DRAGGING", payload: isDragging })
  }, [])

  // Add uploaded photo
  const addUploadedPhoto = useCallback((photo: UploadedPhoto) => {
    dispatch({ type: "ADD_UPLOADED_PHOTO", payload: photo })
  }, [])

  // Remove uploaded photo
  const removeUploadedPhoto = useCallback((photoId: string) => {
    dispatch({ type: "REMOVE_UPLOADED_PHOTO", payload: photoId })
  }, [])

  const value: EditorContextValue = {
    state,
    dispatch,
    updateProjectTitle,
    saveProject,
    setCurrentSpread,
    getCurrentSpreadPages,
    setActivePageSide,
    getActivePage,
    addElementToCanvas,
    updateElementLocal,
    updateElementPosition,
    deleteElementFromCanvas,
    selectElement,
    setDragging,
    addUploadedPhoto,
    removeUploadedPhoto,
  }

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

// Hook to use editor context
export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider")
  }
  return context
}
