"use client"

import { useState } from "react"
import { Camera, LayoutGrid, Layers, Settings } from "lucide-react"
import { PhotosPanel } from "./panels/photos-panel"
import { LayoutsPanel } from "./panels/layouts-panel"
import { ZonesPanel } from "./panels/zones-panel"
import { PropertiesPanel } from "./panels/properties-panel"

type PanelType = "photos" | "layout" | "zones" | "properties" | null

export function EditorToolbar() {
  const [activePanel, setActivePanel] = useState<PanelType>("photos")

  const tools = [
    { id: "photos" as const, icon: Camera, label: "Photos", enabled: true },
    { id: "layout" as const, icon: LayoutGrid, label: "Layout", enabled: true },
    { id: "zones" as const, icon: Layers, label: "Zones", enabled: true },
    { id: "properties" as const, icon: Settings, label: "Properties", enabled: true },
  ]

  return (
    <aside className="fixed right-0 top-16 bottom-14 w-80 border-l flex flex-col" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-border)' }}>
      {/* Tool Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activePanel === tool.id
          const isEnabled = tool.enabled

          return (
            <button
              key={tool.id}
              onClick={() => isEnabled && setActivePanel(tool.id)}
              disabled={!isEnabled}
              className={`flex-1 flex flex-col items-center gap-1 py-3 border-b-2 transition-all ${
                isActive
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : isEnabled
                  ? "border-transparent hover:text-[var(--color-accent)]"
                  : "border-transparent cursor-not-allowed"
              }`}
              style={{
                color: isActive ? 'var(--color-accent)' : isEnabled ? 'var(--color-neutral)' : 'var(--color-secondary)',
                fontFamily: 'var(--font-serif)'
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tool.label}</span>
            </button>
          )
        })}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {activePanel === "photos" && <PhotosPanel />}
        {activePanel === "layout" && <LayoutsPanel />}
        {activePanel === "zones" && <ZonesPanel />}
        {activePanel === "properties" && <PropertiesPanel />}
      </div>
    </aside>
  )
}
