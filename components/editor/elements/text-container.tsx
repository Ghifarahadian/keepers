"use client"

import type { Element, UpdateElementInput } from "@/types/editor"
import { useEditor } from "@/lib/contexts/editor-context"
import { useRef, useCallback, useState, useEffect } from "react"
import { Type } from "lucide-react"
import { BaseElementContainer } from "./base-element-container"
import { TextToolbar } from "../ui/text-toolbar"

interface TextContainerProps {
  element: Element
}

export function TextContainer({ element }: TextContainerProps) {
  const { state, deleteElementFromCanvas, updateElementPosition } = useEditor()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSelected = state.selectedElementId === element.id

  const [isEditing, setIsEditing] = useState(false)
  const [textContent, setTextContent] = useState(element.text_content || "")

  // Sync text content from element
  useEffect(() => {
    setTextContent(element.text_content || "")
  }, [element.text_content])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    // Focus textarea after state update
    setTimeout(() => {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }, 0)
  }, [])

  const handleTextBlur = useCallback(() => {
    setIsEditing(false)
    // Save text content
    if (textContent !== element.text_content) {
      updateElementPosition(element.id, {
        text_content: textContent,
      })
    }
  }, [element.id, element.text_content, textContent, updateElementPosition])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false)
      setTextContent(element.text_content || "")
    }
  }, [element.text_content])

  const handleDelete = useCallback(async () => {
    if (confirm("Delete this text container?")) {
      await deleteElementFromCanvas(element.id)
    }
  }, [element.id, deleteElementFromCanvas])

  const handleTextPropertiesUpdate = useCallback((updates: UpdateElementInput) => {
    updateElementPosition(element.id, updates)
  }, [element.id, updateElementPosition])

  const borderColor = isSelected ? 'rgba(212, 120, 108, 1)'
    : textContent ? 'rgba(212, 120, 108, 0.3)'
    : 'rgba(0, 0, 0, 0.15)'

  const bgColor = isEditing ? 'rgba(255, 255, 255, 1)'
    : textContent ? 'transparent'
    : 'rgba(212, 120, 108, 0.05)'

  return (
    <BaseElementContainer
      element={element}
      toolbarActions={[]}
      borderColor={borderColor}
      backgroundColor={bgColor}
      showControls={!isEditing}
      isDragDisabled={() => isEditing}
      onDoubleClick={handleDoubleClick}
      innerClassName="absolute inset-0 overflow-hidden p-2"
      renderToolbar={
        isSelected && !isEditing ? (
          <TextToolbar
            element={element}
            onUpdate={handleTextPropertiesUpdate}
            onDelete={handleDelete}
          />
        ) : undefined
      }
    >
      {/* Empty state placeholder */}
      {!textContent && !isEditing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Type className="w-8 h-8 mb-2" style={{ color: 'var(--color-secondary)' }} />
          <p
            className="text-sm font-medium text-center px-2"
            style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}
          >
            Double-click to edit
          </p>
        </div>
      )}

      {/* Text display */}
      {textContent && !isEditing && (
        <div
          className="w-full h-full overflow-hidden"
          style={{
            fontFamily: element.font_family || 'var(--font-serif)',
            fontSize: element.font_size ? `${element.font_size}px` : '16px',
            color: element.font_color || 'var(--color-neutral)',
            fontWeight: element.font_weight || 'normal',
            fontStyle: element.font_style || 'normal',
            textDecoration: element.text_decoration || 'none',
            textAlign: element.text_align || 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {textContent}
        </div>
      )}

      {/* Text editing */}
      {isEditing && (
        <textarea
          ref={textareaRef}
          value={textContent}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full resize-none border-none outline-none bg-transparent"
          style={{
            fontFamily: element.font_family || 'var(--font-serif)',
            fontSize: element.font_size ? `${element.font_size}px` : '16px',
            color: element.font_color || 'var(--color-neutral)',
            fontWeight: element.font_weight || 'normal',
            fontStyle: element.font_style || 'normal',
            textDecoration: element.text_decoration || 'none',
            textAlign: element.text_align || 'left',
          }}
          placeholder="Enter your text..."
        />
      )}
    </BaseElementContainer>
  )
}
