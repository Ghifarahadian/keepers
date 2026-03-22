import { createElement } from "react"
import { createRoot } from "react-dom/client"
import { flushSync } from "react-dom"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import type { Project, Page } from "@/types/editor"
import { PdfPageRenderer } from "@/components/editor/pdf/pdf-page-renderer"

const PAGE_WIDTH_PX = 500
const PAGE_HEIGHT_PX = 647

function waitForImages(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll("img"))
  const promises = imgs.map(
    (img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const timeout = setTimeout(resolve, 5000)
            img.onload = img.onerror = () => {
              clearTimeout(timeout)
              resolve()
            }
          })
  )
  return Promise.all(promises).then(() => undefined)
}

async function capturePageAsCanvas(page: Page): Promise<HTMLCanvasElement> {
  const container = document.createElement("div")
  Object.assign(container.style, {
    position: "fixed",
    left: "-9999px",
    top: "0px",
    width: `${PAGE_WIDTH_PX}px`,
    height: `${PAGE_HEIGHT_PX}px`,
    overflow: "hidden",
  })
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    flushSync(() => {
      root.render(createElement(PdfPageRenderer, { page }))
    })

    await document.fonts.ready
    await waitForImages(container)

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: PAGE_WIDTH_PX,
      height: PAGE_HEIGHT_PX,
    })

    return canvas
  } finally {
    root.unmount()
    container.remove()
  }
}

function getPaperFormat(paperSize: string | null | undefined): "a4" | "a5" {
  if (paperSize === "A5") return "a5"
  return "a4"
}

export async function exportProjectToPdf(
  project: Project,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const pages = project.pages ?? []
  if (pages.length === 0) throw new Error("No pages to export")

  const format = getPaperFormat(project.paper_size)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format,
    hotfixes: ["px_scaling"],
  })

  const pdfPageWidth = pdf.internal.pageSize.getWidth()
  const pdfPageHeight = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < pages.length; i++) {
    onProgress?.(i + 1, pages.length)

    const canvas = await capturePageAsCanvas(pages[i])
    const imgData = canvas.toDataURL("image/jpeg", 0.92)

    if (i > 0) pdf.addPage()
    pdf.addImage(imgData, "JPEG", 0, 0, pdfPageWidth, pdfPageHeight)
  }

  const safeName = (project.title || "photobook").replace(/[^a-z0-9]/gi, "_")
  pdf.save(`${safeName}.pdf`)
}
