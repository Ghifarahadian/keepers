import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "KEEPERS - Your Story, Well Kept",
  description: "For the moments worth more than a scroll. Create beautiful custom photobooks.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-serif antialiased">
        {children}
      </body>
    </html>
  )
}
