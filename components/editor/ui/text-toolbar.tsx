"use client"

import type { Element, UpdateElementInput } from "@/types/editor"
import { useState, useRef, useEffect, useCallback } from "react"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown, Trash2 } from "lucide-react"

interface TextToolbarProps {
  element: Element
  onUpdate: (updates: UpdateElementInput) => void
  onDelete: () => void
}

const FONT_OPTIONS = [
  { value: 'var(--font-serif)', label: 'Serif' },
  { value: 'var(--font-sans)', label: 'Sans' },
  { value: 'ui-monospace, monospace', label: 'Mono' },
]

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]

export function TextToolbar({ element, onUpdate, onDelete }: TextToolbarProps) {
  const [showFontDropdown, setShowFontDropdown] = useState(false)
  const [showSizeDropdown, setShowSizeDropdown] = useState(false)
  const fontDropdownRef = useRef<HTMLDivElement>(null)
  const sizeDropdownRef = useRef<HTMLDivElement>(null)

  // Current values with defaults
  const currentFontFamily = element.font_family || 'var(--font-serif)'
  const currentFontSize = element.font_size || 16
  // Default matches --color-neutral from globals.css
  const currentFontColor = element.font_color || '#2D3748'
  const currentFontWeight = element.font_weight || 'normal'
  const currentFontStyle = element.font_style || 'normal'
  const currentTextDecoration = element.text_decoration || 'none'
  const currentTextAlign = element.text_align || 'left'

  // Get display label for current font
  const currentFontLabel = FONT_OPTIONS.find(f => f.value === currentFontFamily)?.label || 'Serif'

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setShowFontDropdown(false)
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target as Node)) {
        setShowSizeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFontChange = useCallback((fontFamily: string) => {
    onUpdate({ font_family: fontFamily })
    setShowFontDropdown(false)
  }, [onUpdate])

  const handleSizeChange = useCallback((size: number) => {
    onUpdate({ font_size: size })
    setShowSizeDropdown(false)
  }, [onUpdate])

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ font_color: e.target.value })
  }, [onUpdate])

  const toggleBold = useCallback(() => {
    onUpdate({ font_weight: currentFontWeight === 'bold' ? 'normal' : 'bold' })
  }, [onUpdate, currentFontWeight])

  const toggleItalic = useCallback(() => {
    onUpdate({ font_style: currentFontStyle === 'italic' ? 'normal' : 'italic' })
  }, [onUpdate, currentFontStyle])

  const toggleUnderline = useCallback(() => {
    onUpdate({ text_decoration: currentTextDecoration === 'underline' ? 'none' : 'underline' })
  }, [onUpdate, currentTextDecoration])

  const setAlignment = useCallback((align: 'left' | 'center' | 'right') => {
    onUpdate({ text_align: align })
  }, [onUpdate])

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white rounded-lg shadow-lg px-1 py-1 z-50"
      style={{ bottom: 'calc(100% + 8px)' }}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      {/* Font Family Dropdown */}
      <div className="relative" ref={fontDropdownRef}>
        <button
          onClick={() => setShowFontDropdown(!showFontDropdown)}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors min-w-[52px]"
          title="Font family"
        >
          <span className="font-medium">{currentFontLabel}</span>
          <ChevronDown size={12} />
        </button>
        {showFontDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[100px] z-50">
            {FONT_OPTIONS.map(font => (
              <button
                key={font.value}
                onClick={() => handleFontChange(font.value)}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                  currentFontFamily === font.value ? 'font-medium' : 'hover:bg-gray-100'
                }`}
                style={{
                  fontFamily: font.value,
                  backgroundColor: currentFontFamily === font.value ? 'var(--color-accent-light)' : undefined,
                  color: currentFontFamily === font.value ? 'var(--color-accent)' : undefined
                }}
              >
                {font.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Font Size Dropdown */}
      <div className="relative" ref={sizeDropdownRef}>
        <button
          onClick={() => setShowSizeDropdown(!showSizeDropdown)}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors min-w-[40px]"
          title="Font size"
        >
          <span className="font-medium">{currentFontSize}</span>
          <ChevronDown size={12} />
        </button>
        {showSizeDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 max-h-48 overflow-y-auto z-50">
            {FONT_SIZES.map(size => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                  currentFontSize === size ? 'font-medium' : 'hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: currentFontSize === size ? 'var(--color-accent-light)' : undefined,
                  color: currentFontSize === size ? 'var(--color-accent)' : undefined
                }}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Color Picker */}
      <div className="relative">
        <input
          type="color"
          value={currentFontColor}
          onChange={handleColorChange}
          className="w-6 h-6 cursor-pointer rounded border border-gray-200"
          title="Text color"
          style={{ padding: 0 }}
        />
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Bold */}
      <button
        onClick={toggleBold}
        className={`p-1.5 rounded transition-colors ${
          currentFontWeight === 'bold' ? '' : 'hover:bg-gray-100'
        }`}
        style={{
          backgroundColor: currentFontWeight === 'bold' ? 'var(--color-accent-light)' : undefined,
          color: currentFontWeight === 'bold' ? 'var(--color-accent)' : undefined
        }}
        title="Bold"
      >
        <Bold size={14} />
      </button>

      {/* Italic */}
      <button
        onClick={toggleItalic}
        className={`p-1.5 rounded transition-colors ${
          currentFontStyle === 'italic' ? '' : 'hover:bg-gray-100'
        }`}
        style={{
          backgroundColor: currentFontStyle === 'italic' ? 'var(--color-accent-light)' : undefined,
          color: currentFontStyle === 'italic' ? 'var(--color-accent)' : undefined
        }}
        title="Italic"
      >
        <Italic size={14} />
      </button>

      {/* Underline */}
      <button
        onClick={toggleUnderline}
        className={`p-1.5 rounded transition-colors ${
          currentTextDecoration === 'underline' ? '' : 'hover:bg-gray-100'
        }`}
        style={{
          backgroundColor: currentTextDecoration === 'underline' ? 'var(--color-accent-light)' : undefined,
          color: currentTextDecoration === 'underline' ? 'var(--color-accent)' : undefined
        }}
        title="Underline"
      >
        <Underline size={14} />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Alignment Buttons */}
      <button
        onClick={() => setAlignment('left')}
        className={`p-1.5 rounded transition-colors ${
          currentTextAlign === 'left' ? '' : 'hover:bg-gray-100'
        }`}
        style={{
          backgroundColor: currentTextAlign === 'left' ? 'var(--color-accent-light)' : undefined,
          color: currentTextAlign === 'left' ? 'var(--color-accent)' : undefined
        }}
        title="Align left"
      >
        <AlignLeft size={14} />
      </button>

      <button
        onClick={() => setAlignment('center')}
        className={`p-1.5 rounded transition-colors ${
          currentTextAlign === 'center' ? '' : 'hover:bg-gray-100'
        }`}
        style={{
          backgroundColor: currentTextAlign === 'center' ? 'var(--color-accent-light)' : undefined,
          color: currentTextAlign === 'center' ? 'var(--color-accent)' : undefined
        }}
        title="Align center"
      >
        <AlignCenter size={14} />
      </button>

      <button
        onClick={() => setAlignment('right')}
        className={`p-1.5 rounded transition-colors ${
          currentTextAlign === 'right' ? '' : 'hover:bg-gray-100'
        }`}
        style={{
          backgroundColor: currentTextAlign === 'right' ? 'var(--color-accent-light)' : undefined,
          color: currentTextAlign === 'right' ? 'var(--color-accent)' : undefined
        }}
        title="Align right"
      >
        <AlignRight size={14} />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 mx-0.5" />

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="p-1.5 rounded transition-colors hover:bg-red-50"
        title="Delete text"
      >
        <Trash2 size={14} className="text-red-500" />
      </button>
    </div>
  )
}
