"use client"

import { useState } from "react"
import { Camera, LayoutGrid, Type, Sparkles, Palette } from "lucide-react"
import { PhotosPanel } from "./panels/photos-panel"
import { LayoutsPanel } from "./panels/layouts-panel"

type PanelType = "photos" | "layout" | "text" | "ai" | "color" | null

export function EditorToolbar() {
  const [activePanel, setActivePanel] = useState<PanelType>("photos")

  const tools = [
    { id: "photos" as const, icon: Camera, label: "Photos", enabled: true },
    { id: "layout" as const, icon: LayoutGrid, label: "Layout", enabled: true },
    { id: "text" as const, icon: Type, label: "Text", enabled: false },
    { id: "ai" as const, icon: Sparkles, label: "AI", enabled: false },
    { id: "color" as const, icon: Palette, label: "Color", enabled: false },
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
        {activePanel === "text" && (
          <div className="p-8 text-center" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
            <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Text tool coming soon</p>
          </div>
        )}
        {activePanel === "ai" && (
          <div className="p-8 text-center" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">AI features coming soon</p>
          </div>
        )}
        {activePanel === "color" && (
          <div className="p-8 text-center" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
            <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Color tools coming soon</p>
          </div>
        )}
      </div>
    </aside>
  )
}
