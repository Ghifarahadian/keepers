"use client"

import { FaInstagram, FaTiktok } from "react-icons/fa"

const socialLinks = [
  { icon: FaInstagram, href: "https://www.instagram.com/keepers_id/", label: "Instagram" },
  { icon: FaTiktok, href: "https://www.tiktok.com/@thisisarinok", label: "TikTok" }
]

export function SocialLinks() {
  return (
    <div className="flex gap-6 items-center justify-center">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-[var(--color-primary-text)] hover:text-[var(--color-primary-text-muted)] transition-colors"
        >
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  )
}
