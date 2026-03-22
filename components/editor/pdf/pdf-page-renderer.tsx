"use client"

import type { Page, Zone, Element } from "@/types/editor"

interface ZoneWithElements extends Zone {
  elements?: Element[]
}

interface PdfPageRendererProps {
  page: Page
}

export function PdfPageRenderer({ page }: PdfPageRendererProps) {
  const zones = ((page.zones || []) as ZoneWithElements[])

  return (
    <div
      style={{
        position: "relative",
        width: "500px",
        height: "647px",
        overflow: "hidden",
        backgroundColor: page.page_color || "#ffffff",
        boxSizing: "border-box",
      }}
    >
      {zones.map((zone) => {
        const elements = zone.elements || []
        return (
          <div
            key={zone.id}
            style={{
              position: "absolute",
              left: `${zone.position_x}%`,
              top: `${zone.position_y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {elements.map((element) => {
              if (element.type === "photo" && element.photo_url) {
                return (
                  <img
                    key={element.id}
                    src={element.photo_url}
                    crossOrigin="anonymous"
                    alt=""
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: `${element.position_x}% ${element.position_y}%`,
                      transform: `scale(${(element.width || 100) / 100})`,
                      transformOrigin: `${element.position_x}% ${element.position_y}%`,
                    }}
                  />
                )
              }
              if (element.type === "text") {
                const fontFamily = element.font_family?.startsWith("var(")
                  ? "Georgia, serif"
                  : element.font_family || "Georgia, serif"
                return (
                  <div
                    key={element.id}
                    style={{
                      position: "absolute",
                      inset: 0,
                      padding: "8px",
                      fontFamily,
                      fontSize: element.font_size ? `${element.font_size}px` : "16px",
                      color: element.font_color || "#000000",
                      fontWeight: element.font_weight || "normal",
                      fontStyle: element.font_style || "normal",
                      textAlign: (element.text_align as React.CSSProperties["textAlign"]) || "left",
                      textDecoration:
                        element.text_decoration !== "none" ? element.text_decoration || "none" : "none",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    {element.text_content || ""}
                  </div>
                )
              }
              return null
            })}
          </div>
        )
      })}
    </div>
  )
}
