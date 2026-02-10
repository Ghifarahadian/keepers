import type { Zone } from "@/types/editor"

// ============================================
// ZONE PREVIEW COMPONENT
// ============================================

interface ZonePreviewProps {
  zones: Zone[]
  mode?: 'display' | 'interactive'
  aspectRatio?: string
  canvasClassName?: string
  onZoneSelect?: (zone: Zone) => void
  selectedZoneId?: string | null
  width?: string
  height?: string
}

/**
 * Reusable zone visualization component
 * Renders zones with percentage-based positioning
 * Supports both static display and interactive selection
 */
export function ZonePreview({
  zones,
  mode = 'display',
  aspectRatio = '8.5 / 11',
  canvasClassName = '',
  onZoneSelect,
  selectedZoneId,
  width = 'w-12',
  height = 'h-16',
}: ZonePreviewProps) {
  return (
    <div
      className={`${width} ${height} border rounded relative overflow-hidden flex-shrink-0 ${canvasClassName}`}
      style={{
        backgroundColor: "var(--color-white)",
        borderColor: "var(--color-border)",
        aspectRatio,
      }}
    >
      {zones.map((zone, idx) => {
        const isSelected = mode === 'interactive' && selectedZoneId === zone.id

        return (
          <div
            key={zone.id || idx}
            className={`absolute ${mode === 'interactive' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            style={{
              left: `${zone.position_x}%`,
              top: `${zone.position_y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              backgroundColor: zone.zone_type === "text"
                ? "var(--color-accent)"
                : "var(--color-secondary)",
              opacity: isSelected ? 0.9 : 0.6,
              border: isSelected ? '2px solid var(--color-primary)' : 'none',
            }}
            onClick={() => {
              if (mode === 'interactive' && onZoneSelect) {
                onZoneSelect(zone)
              }
            }}
            title={zone.zone_type === 'text' ? 'Text zone' : 'Photo zone'}
          />
        )
      })}
    </div>
  )
}

/**
 * Mini zone preview for thumbnails (smaller version)
 */
export function ZonePreviewMini({ zones }: { zones: Zone[] }) {
  return (
    <ZonePreview
      zones={zones}
      mode="display"
      width="w-8"
      height="h-10"
    />
  )
}

/**
 * Full-size zone preview for page builder
 */
export function ZonePreviewFull({
  zones,
  onZoneSelect,
  selectedZoneId
}: {
  zones: Zone[]
  onZoneSelect?: (zone: Zone) => void
  selectedZoneId?: string | null
}) {
  return (
    <ZonePreview
      zones={zones}
      mode={onZoneSelect ? 'interactive' : 'display'}
      width="w-full"
      height="h-auto"
      aspectRatio="8.5 / 11"
      canvasClassName="min-h-[400px]"
      onZoneSelect={onZoneSelect}
      selectedZoneId={selectedZoneId}
    />
  )
}
