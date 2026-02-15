"use client"

import React, { memo, useMemo } from "react"
import { useEditor, getItemPages } from "@/lib/contexts/editor-context"
import { deletePage } from "@/lib/editor-actions"
import type { Page, Element } from "@/types/editor"

interface PageThumbnailProps {
  page: Page | null
  elements: Element[]
  uploadedPhotos: { path: string; url: string }[]
  isDragging: boolean
}

// Mini preview component for page thumbnails - renders elements directly
// Memoized to prevent re-renders during element dragging
const PageThumbnail = memo(function PageThumbnail({
  page,
  elements,
  uploadedPhotos,
}: PageThumbnailProps) {
  if (!page) {
    return (
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--color-white)', aspectRatio: '8.5 / 11' }}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[6px]" style={{ color: 'var(--color-secondary)' }}>Empty</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: 'var(--color-white)', aspectRatio: '8.5 / 11' }}>
      {elements.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[6px]" style={{ color: 'var(--color-secondary)' }}>Empty</span>
        </div>
      ) : (
        elements.map((element) => (
          <div
            key={element.id}
            className="absolute overflow-hidden"
            style={{
              left: `${element.position_x}%`,
              top: `${element.position_y}%`,
              width: `${element.width}%`,
              height: `${element.height}%`,
              border: '1px dashed rgba(0,0,0,0.1)',
            }}
          >
            {element.type === 'photo' && (() => {
              const photo = uploadedPhotos.find(p => p.path === element.photo_storage_path)
              const photoUrl = photo?.url || element.photo_url || ""
              if (!photoUrl) return null
              return (
                <img
                  src={photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )
            })()}
            {element.type === 'text' && element.text_content && (() => {
              const baseFontSize = element.font_size || 16
              const scaledFontSize = Math.max(2, baseFontSize * 0.15)
              return (
                <div
                  className="w-full h-full overflow-hidden p-0.5"
                  style={{
                    fontSize: `${scaledFontSize}px`,
                    lineHeight: 1.2,
                    fontFamily: element.font_family || 'var(--font-serif)',
                    fontWeight: element.font_weight || 'normal',
                    fontStyle: element.font_style || 'normal',
                    textDecoration: element.text_decoration || 'none',
                    textAlign: element.text_align || 'left',
                    color: element.font_color || 'var(--color-neutral)',
                  }}
                >
                  <span className="w-full">{element.text_content}</span>
                </div>
              )
            })()}
          </div>
        ))
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  if (nextProps.isDragging) return true
  return (
    prevProps.page?.id === nextProps.page?.id &&
    prevProps.elements === nextProps.elements &&
    prevProps.uploadedPhotos === nextProps.uploadedPhotos
  )
})

type ItemType = 'cover-front' | 'cover-back' | 'spread'

interface PageItem {
  type: ItemType
  itemIndex: number
  leftPage: Page | null
  rightPage: Page | null
  label: string
}

export function EditorPagebar() {
  const { state, setCurrentSpread, dispatch } = useEditor()

  // Helper: Get all elements for a page by aggregating from all zones
  const getPageElements = useMemo(() => (page: Page | null): Element[] => {
    if (!page) return []
    const zones = state.zones[page.id] || []
    const allElements: Element[] = []
    zones.forEach(zone => {
      const zoneElements = state.elements[zone.id] || []
      allElements.push(...zoneElements)
    })
    return allElements
  }, [state.zones, state.elements])

  // Build the ordered list of page items (front cover, inner spreads, back cover)
  const items = useMemo((): PageItem[] => {
    const pages = state.pages
    const result: PageItem[] = []

    if (pages.length === 0) {
      return [{ type: 'cover-front', itemIndex: 0, leftPage: null, rightPage: null, label: 'Front Cover' }]
    }

    // Front cover (item 0 – single page)
    result.push({
      type: 'cover-front',
      itemIndex: 0,
      leftPage: pages[0],
      rightPage: null,
      label: 'Front Cover',
    })

    // Inner spreads
    const lastItemIndex = Math.floor(pages.length / 2)
    for (let i = 1; i < lastItemIndex; i++) {
      const [left, right] = getItemPages(i, pages)
      const leftNum = i * 2       // 1-indexed page numbers shown in label
      const rightNum = i * 2 + 1
      result.push({
        type: 'spread',
        itemIndex: i,
        leftPage: left,
        rightPage: right,
        label: `Pages ${leftNum}–${rightNum}`,
      })
    }

    // Back cover (last item – single page)
    if (pages.length >= 2) {
      result.push({
        type: 'cover-back',
        itemIndex: lastItemIndex,
        leftPage: null,
        rightPage: pages[pages.length - 1],
        label: 'Back Cover',
      })
    }

    return result
  }, [state.pages])

  // Delete an inner spread (both pages)
  const handleDeleteItem = async (item: PageItem) => {
    if (item.type !== 'spread') return

    const innerSpreads = items.filter(i => i.type === 'spread')
    if (innerSpreads.length <= 1) {
      alert("You must have at least one inner spread")
      return
    }

    if (!confirm("Are you sure you want to delete this spread (both pages)?")) return

    try {
      if (item.leftPage) {
        await deletePage(item.leftPage.id, state.project.id)
        dispatch({ type: "DELETE_PAGE", payload: item.leftPage.id })
      }
      if (item.rightPage) {
        await deletePage(item.rightPage.id, state.project.id)
        dispatch({ type: "DELETE_PAGE", payload: item.rightPage.id })
      }
    } catch (error) {
      console.error("Failed to delete spread:", error)
    }
  }

  return (
    <aside className="fixed left-0 top-16 bottom-14 w-60 border-r overflow-y-auto" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-border)' }}>
      <div className="p-4 space-y-3">
        {items.map((item) => {
          const isCover = item.type === 'cover-front' || item.type === 'cover-back'
          const coverPage = isCover ? (item.leftPage ?? item.rightPage) : null
          const innerSpreads = items.filter(i => i.type === 'spread')
          const canDelete = item.type === 'spread' && innerSpreads.length > 1

          return (
            <div
              key={`item-${item.itemIndex}`}
              className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                state.currentSpreadIndex === item.itemIndex
                  ? "border-[var(--color-accent)] shadow-md"
                  : "hover:shadow-sm"
              }`}
              style={{
                backgroundColor: 'var(--color-white)',
                borderColor: state.currentSpreadIndex === item.itemIndex ? 'var(--color-accent)' : 'var(--color-border)'
              }}
              onClick={() => setCurrentSpread(item.itemIndex)}
            >
              {isCover ? (
                /* Cover thumbnail – single page, centered */
                <div className="flex justify-center p-1" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
                  <div style={{ width: '50%' }}>
                    <PageThumbnail
                      page={coverPage}
                      elements={getPageElements(coverPage)}
                      uploadedPhotos={state.uploadedPhotos}
                      isDragging={state.isDragging}
                    />
                  </div>
                </div>
              ) : (
                /* Spread thumbnail – two pages side by side */
                <div className="flex gap-0.5 p-1" style={{ backgroundColor: 'var(--color-primary-bg-light)' }}>
                  <PageThumbnail
                    page={item.leftPage}
                    elements={getPageElements(item.leftPage)}
                    uploadedPhotos={state.uploadedPhotos}
                    isDragging={state.isDragging}
                  />
                  <PageThumbnail
                    page={item.rightPage}
                    elements={getPageElements(item.rightPage)}
                    uploadedPhotos={state.uploadedPhotos}
                    isDragging={state.isDragging}
                  />

                  {/* Delete button – inner spreads only */}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteItem(item)
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: 'var(--color-error)',
                        color: 'var(--color-white)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error)'}
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {/* Item label */}
              <div className="p-1.5 text-center">
                <span className="text-xs font-medium" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
                  {item.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
