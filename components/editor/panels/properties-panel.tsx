"use client"

import { useEditor } from "@/lib/contexts/editor-context"
import { FileText, Ruler, Ticket, BookOpen } from "lucide-react"

export function PropertiesPanel() {
  const { state } = useEditor()
  const { project, pages } = state

  const propertyGroups = [
    {
      icon: BookOpen,
      label: "Project Title",
      value: project.title || "Untitled Project"
    },
    {
      icon: FileText,
      label: "Total Pages",
      value: pages.length.toString()
    },
    {
      icon: Ruler,
      label: "Paper Size",
      value: project.paper_size || "Not Set"
    },
    {
      icon: Ticket,
      label: "Voucher Code",
      value: project.voucher_code || "None"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-neutral)' }}>
          Project Properties
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-secondary)' }}>
          Read-only project information
        </p>
      </div>

      <div className="space-y-4">
        {propertyGroups.map((group) => {
          const Icon = group.icon
          return (
            <div
              key={group.label}
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md" style={{ backgroundColor: 'var(--color-white)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-serif)' }}>
                    {group.label}
                  </p>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-neutral)', fontFamily: 'var(--font-serif)' }}>
                    {group.value}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-secondary)' }}>
          <span className="opacity-70">ⓘ</span>
          <p className="leading-relaxed">
            These properties are set when the project is created. To modify them, please create a new project with the desired configuration.
          </p>
        </div>
      </div>
    </div>
  )
}
