"use client"

interface ResizeHandlesProps {
  borderColor: string
  onResizeStart: (direction: string) => void
}

export function ResizeHandles({ borderColor, onResizeStart }: ResizeHandlesProps) {
  return (
    <>
      {/* East handle */}
      <div
        className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded cursor-ew-resize z-10"
        style={{ backgroundColor: borderColor }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart("e")
        }}
      />

      {/* South handle */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded cursor-ns-resize z-10"
        style={{ backgroundColor: borderColor }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart("s")
        }}
      />

      {/* South-East corner handle */}
      <div
        className="absolute -right-1 -bottom-1 w-3 h-3 rounded cursor-nwse-resize z-10"
        style={{ backgroundColor: borderColor }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart("se")
        }}
      />

      {/* West handle */}
      <div
        className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded cursor-ew-resize z-10"
        style={{ backgroundColor: borderColor }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart("w")
        }}
      />

      {/* North handle */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded cursor-ns-resize z-10"
        style={{ backgroundColor: borderColor }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart("n")
        }}
      />

      {/* North-West corner handle */}
      <div
        className="absolute -left-1 -top-1 w-3 h-3 rounded cursor-nwse-resize z-10"
        style={{ backgroundColor: borderColor }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart("nw")
        }}
      />

      {/* North-East corner handle */}
      <div
        className="absolute -right-1 -top-1 w-3 h-3 rounded cursor-nesw-resize z-10"
        style={{ backgroundColor: borderColor }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart("ne")
        }}
      />

      {/* South-West corner handle */}
      <div
        className="absolute -left-1 -bottom-1 w-3 h-3 rounded cursor-nesw-resize z-10"
        style={{ backgroundColor: borderColor }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart("sw")
        }}
      />
    </>
  )
}
