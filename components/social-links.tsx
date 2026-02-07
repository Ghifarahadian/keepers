"use client"

import { Instagram } from "lucide-react"

// TikTok icon (not available in Lucide, using custom SVG)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

// Shopee icon (using custom image)
function ShopeeIcon({ className }: { className?: string }) {
  return (
    <img
      src="/icons/shopee.png"
      alt="Shopee"
      className={className}
    />
  )
}

export function SocialLinks() {
  return (
    <div className="flex gap-6 items-center justify-center">
      <a
        href="https://www.instagram.com/keepers_id/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="text-[var(--color-primary-text)] hover:text-[var(--color-primary-text-muted)] transition-colors"
      >
        <Instagram className="w-5 h-5" />
      </a>
      <a
        href="https://www.tiktok.com/@keepers_id"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="text-[var(--color-primary-text)] hover:text-[var(--color-primary-text-muted)] transition-colors"
      >
        <TikTokIcon className="w-5 h-5" />
      </a>
      <a
        href="#"
        aria-label="Shopee"
        className="text-[var(--color-primary-text)] hover:text-[var(--color-primary-text-muted)] transition-colors cursor-pointer"
      >
        <ShopeeIcon className="w-5 h-5" />
      </a>
    </div>
  )
}
