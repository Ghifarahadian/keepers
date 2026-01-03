"use client"

import { Search, Menu } from "lucide-react"

interface HeaderProps {
  variant?: 'default' | 'coming-soon'
}

export function Header({ variant = 'default' }: HeaderProps) {
  const isComingSoon = variant === 'coming-soon'

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#f5f3ef] border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className={`flex items-center ${isComingSoon ? 'justify-center' : 'justify-between'}`}>
          {/* Logo */}
          <div className="text-2xl font-bold tracking-tight">
            KEEPERS
          </div>

          {/* Right side icons - only show in default mode */}
          {!isComingSoon && (
            <div className="flex items-center gap-6">
              <button className="hover:opacity-70 transition-opacity">
                <Search className="w-6 h-6" />
              </button>
              <button className="hover:opacity-70 transition-opacity">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
