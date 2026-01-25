"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  FileText,
  Folder,
  Home,
  Settings,
  LogOut,
} from "lucide-react"
import type { AdminProfile } from "@/types/template"
import { signOut } from "@/lib/auth-actions"

interface AdminSidebarProps {
  admin: AdminProfile
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/layouts", label: "Layouts", icon: LayoutGrid },
  { href: "/admin/templates", label: "Templates", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: Folder },
]

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 border-r flex flex-col"
      style={{
        backgroundColor: "var(--color-white)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Header */}
      <div
        className="p-6 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Link href="/" className="block">
          <h1
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-neutral)",
            }}
          >
            KEEPERS
          </h1>
          <span
            className="text-xs"
            style={{ color: "var(--color-secondary)" }}
          >
            Admin Panel
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors`}
              style={{
                backgroundColor: isActive
                  ? "var(--color-accent)"
                  : "transparent",
                color: isActive ? "var(--color-white)" : "var(--color-neutral)",
              }}
            >
              <Icon className="w-5 h-5" />
              <span
                className="font-medium"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div
        className="p-4 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            {admin.first_name?.[0] || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-medium truncate"
              style={{
                color: "var(--color-neutral)",
                fontFamily: "var(--font-serif)",
              }}
            >
              {admin.first_name || "Admin"}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--color-secondary)" }}
            >
              Administrator
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/settings"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Settings className="w-4 h-4" style={{ color: "var(--color-neutral)" }} />
          </Link>
          <button
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--color-border)" }}
          >
            <LogOut className="w-4 h-4" style={{ color: "var(--color-neutral)" }} />
          </button>
        </div>
      </div>
    </aside>
  )
}
