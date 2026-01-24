"use client"

import React, { createContext, useContext, useReducer, useCallback } from "react"
import type { Project, Page, Element, PageZone, EditorState, EditorAction, UploadedPhoto, UpdateElementInput, UpdateZoneInput } from "@/types/editor"
import { updateProject, updateElement, createElement, deleteElement, updateZone, deleteZone } from "@/lib/editor-actions"

// Initial state
const createInitialState = (project: Project, uploadedPhotos?: UploadedPhoto[]): EditorState => ({
  project,
  pages: project.pages || [],
  currentPageId: project.pages?.[0]?.id || "",
  elements: project.pages?.reduce((acc, page) => {
    acc[page.id] = page.elements || []
    return acc
  }, {} as Record<string, Element[]>) || {},
  zones: project.pages?.reduce((acc, page) => {
    acc[page.id] = page.zones || []
    return acc
  }, {} as Record<string, PageZone[]>) || {},
  uploadedPhotos: uploadedPhotos || [],
  selectedElementId: null,
  selectedZoneId: null,
  isSaving: false,
  lastSaved: null,
  error: null,
  isDraggingZone: false,
})

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_PROJECT":
      return { ...state, project: action.payload }

    case "SET_PAGES":
      return { ...state, pages: action.payload }

    case "SET_CURRENT_PAGE":
      return { ...state, currentPageId: action.payload, selectedElementId: null, selectedZoneId: null }

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
        zones: { ...state.zones, [action.payload.id]: action.payload.zones || [] },
      }

    case "DELETE_PAGE": {
      const newPages = state.pages.filter((p) => p.id !== action.payload)
      const newElements = { ...state.elements }
      const newZones = { ...state.zones }
      delete newElements[action.payload]
      delete newZones[action.payload]
      return {
        ...state,
        pages: newPages,
        elements: newElements,
        zones: newZones,
        currentPageId: state.currentPageId === action.payload ? newPages[0]?.id || "" : state.currentPageId,
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
      const newElements = { ...state.elements }
      Object.keys(newElements).forEach((pageId) => {
        newElements[pageId] = newElements[pageId].map((el) =>
          el.id === action.payload.elementId ? { ...el, ...action.payload.updates } : el
        )
      })
      return { ...state, elements: newElements }
    }

    case "DELETE_ELEMENT": {
      const newElements = { ...state.elements }
      Object.keys(newElements).forEach((pageId) => {
        newElements[pageId] = newElements[pageId].filter((el) => el.id !== action.payload.elementId)
      })
      return {
        ...state,
        elements: newElements,
        selectedElementId: state.selectedElementId === action.payload.elementId ? null : state.selectedElementId,
      }
    }

    case "SET_ZONES":
      return {
        ...state,
        zones: { ...state.zones, [action.payload.pageId]: action.payload.zones },
      }

    case "UPDATE_ZONE": {
      const newZones = { ...state.zones }
      Object.keys(newZones).forEach((pageId) => {
        newZones[pageId] = newZones[pageId].map((zone) =>
          zone.id === action.payload.zoneId ? { ...zone, ...action.payload.updates } : zone
        )
      })
      return { ...state, zones: newZones }
    }

    case "DELETE_ZONE": {
      const newZones = { ...state.zones }
      Object.keys(newZones).forEach((pageId) => {
        newZones[pageId] = newZones[pageId].filter((zone) => zone.id !== action.payload.zoneId)
      })
      return {
        ...state,
        zones: newZones,
        selectedZoneId: state.selectedZoneId === action.payload.zoneId ? null : state.selectedZoneId,
      }
    }

    case "SELECT_ELEMENT":
      return { ...state, selectedElementId: action.payload, selectedZoneId: null }

    case "SELECT_ZONE":
      return { ...state, selectedZoneId: action.payload, selectedElementId: null }

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

    case "SET_DRAGGING_ZONE":
      return { ...state, isDraggingZone: action.payload }

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

  // Page actions
  setCurrentPage: (pageId: string) => void

  // Element actions
  addElementToCanvas: (pageId: string, element: Omit<Element, "id" | "created_at" | "updated_at">) => Promise<void>
  updateElementLocal: (elementId: string, updates: UpdateElementInput) => void
  updateElementPosition: (elementId: string, updates: UpdateElementInput) => Promise<void>
  deleteElementFromCanvas: (elementId: string) => Promise<void>
  selectElement: (elementId: string | null) => void

  // Zone actions
  selectZone: (zoneId: string | null) => void
  updateZonePosition: (zoneId: string, updates: UpdateZoneInput) => Promise<void>
  deleteZoneFromCanvas: (zoneId: string) => Promise<void>
  setDraggingZone: (isDragging: boolean) => void

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

  // Set current page
  const setCurrentPage = useCallback((pageId: string) => {
    dispatch({ type: "SET_CURRENT_PAGE", payload: pageId })
  }, [])

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
          zone_index: element.zone_index,
        })

        dispatch({ type: "ADD_ELEMENT", payload: { pageId, element: newElement } })
      } catch (error) {
        console.error("Add element error:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to add photo" })
      }
    },
    []
  )

  // Update element locally only (no server call) - for dragging/resizing
  const updateElementLocal = useCallback((elementId: string, updates: UpdateElementInput) => {
    dispatch({ type: "UPDATE_ELEMENT", payload: { elementId, updates } })
  }, [])

  // Update element position and save to server
  const updateElementPosition = useCallback(async (elementId: string, updates: UpdateElementInput) => {
    dispatch({ type: "UPDATE_ELEMENT", payload: { elementId, updates } })
    try {
      await updateElement(elementId, updates)
    } catch (error) {
      console.error("Update element error:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update photo" })
    }
  }, [])

  // Delete element
  const deleteElementFromCanvas = useCallback(async (elementId: string) => {
    try {
      await deleteElement(elementId)
      dispatch({ type: "DELETE_ELEMENT", payload: { elementId } })
    } catch (error) {
      console.error("Delete element error:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to delete photo" })
    }
  }, [])

  // Select element
  const selectElement = useCallback((elementId: string | null) => {
    dispatch({ type: "SELECT_ELEMENT", payload: elementId })
  }, [])

  // Select zone (for empty zones)
  const selectZone = useCallback((zoneId: string | null) => {
    dispatch({ type: "SELECT_ZONE", payload: zoneId })
  }, [])

  // Update zone position and save to server
  const updateZonePosition = useCallback(async (zoneId: string, updates: UpdateZoneInput) => {
    dispatch({ type: "UPDATE_ZONE", payload: { zoneId, updates } })
    try {
      await updateZone(zoneId, updates)
    } catch (error) {
      console.error("Update zone error:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update zone" })
    }
  }, [])

  // Delete zone from canvas
  const deleteZoneFromCanvas = useCallback(async (zoneId: string) => {
    try {
      await deleteZone(zoneId)
      dispatch({ type: "DELETE_ZONE", payload: { zoneId } })
    } catch (error) {
      console.error("Delete zone error:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to delete zone" })
    }
  }, [])

  // Set dragging zone state (for thumbnail optimization)
  const setDraggingZone = useCallback((isDragging: boolean) => {
    dispatch({ type: "SET_DRAGGING_ZONE", payload: isDragging })
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
    setCurrentPage,
    addElementToCanvas,
    updateElementLocal,
    updateElementPosition,
    deleteElementFromCanvas,
    selectElement,
    selectZone,
    updateZonePosition,
    deleteZoneFromCanvas,
    setDraggingZone,
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
