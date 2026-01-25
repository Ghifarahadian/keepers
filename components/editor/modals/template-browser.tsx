"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, ArrowLeft, Loader2, Star, Check } from "lucide-react"
import type { Template, TemplateCategory } from "@/types/template"
import { getTemplates, getTemplateCategories, createProjectFromTemplate } from "@/lib/template-actions"

interface TemplateBrowserProps {
  onBack: () => void
  onClose: () => void
}

export function TemplateBrowser({ onBack, onClose }: TemplateBrowserProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [temps, cats] = await Promise.all([
          getTemplates(),
          getTemplateCategories(),
        ])
        setTemplates(temps)
        setCategories(cats)
      } catch (error) {
        console.error("Failed to load templates:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredTemplates = selectedCategory
    ? templates.filter((t) => t.category?.slug === selectedCategory)
    : templates

  const featuredTemplates = templates.filter((t) => t.is_featured)

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplateId(templateId)
    setIsCreating(true)
    try {
      const project = await createProjectFromTemplate(templateId)
      router.push(`/editor/${project.id}`)
    } catch (error) {
      console.error("Failed to create project from template:", error)
      setIsCreating(false)
      setSelectedTemplateId(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-8 relative max-h-[85vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-neutral)" }}
          >
            Choose a Template
          </h2>
          <p className="text-gray-500 mt-2">
            Start with a pre-designed layout or browse by category
          </p>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "var(--color-accent)" }}
            />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-gray-500 mb-4">No templates available yet.</p>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Create Blank Project
            </button>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? "text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === null ? "var(--color-accent)" : "transparent",
                }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.slug
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory === cat.slug ? "var(--color-accent)" : "transparent",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Featured Section (only when "All" is selected) */}
            {selectedCategory === null && featuredTemplates.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-lg font-semibold mb-3 flex items-center gap-2"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--color-neutral)",
                  }}
                >
                  <Star className="w-5 h-5" style={{ color: "rgb(234, 179, 8)" }} />
                  Featured
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {featuredTemplates.slice(0, 3).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplateId === template.id}
                      isCreating={isCreating && selectedTemplateId === template.id}
                      onSelect={() => handleSelectTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto">
              <h3
                className="text-lg font-semibold mb-3"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-neutral)",
                }}
              >
                {selectedCategory
                  ? categories.find((c) => c.slug === selectedCategory)?.name
                  : "All Templates"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplateId === template.id}
                    isCreating={isCreating && selectedTemplateId === template.id}
                    onSelect={() => handleSelectTemplate(template.id)}
                  />
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No templates in this category yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: Template
  isSelected: boolean
  isCreating: boolean
  onSelect: () => void
}

function TemplateCard({ template, isSelected, isCreating, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={isCreating}
      className={`relative rounded-lg border overflow-hidden transition-all text-left ${
        isSelected
          ? "ring-2 ring-offset-2"
          : "hover:shadow-md hover:border-gray-300"
      } disabled:cursor-not-allowed`}
      style={{
        borderColor: isSelected ? "var(--color-accent)" : "#e5e7eb",
        // @ts-expect-error - Tailwind CSS variable for ring color
        "--tw-ring-color": "var(--color-accent)",
      }}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] relative bg-gray-100">
        {template.thumbnail_url ? (
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No preview</span>
          </div>
        )}

        {/* Loading overlay */}
        {isCreating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && !isCreating && (
          <div className="absolute top-2 right-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Featured badge */}
        {template.is_featured && (
          <div className="absolute top-2 left-2">
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: "rgba(234, 179, 8, 0.9)",
                color: "white",
              }}
            >
              <Star className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h4
          className="font-medium text-gray-900 truncate"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {template.name}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {template.page_count} pages
          {template.category && ` • ${template.category.name}`}
        </p>
      </div>
    </button>
  )
}
