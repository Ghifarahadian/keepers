"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="font-bold text-2xl text-primary">memorybook</div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-sm hover:text-primary transition-colors">
              Products
            </a>
            <a href="#about" className="text-sm hover:text-primary transition-colors">
              About
            </a>
            <a href="#testimonials" className="text-sm hover:text-primary transition-colors">
              Reviews
            </a>
            <a href="#contact" className="text-sm hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm">Create Book</Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a href="#products" className="block text-sm hover:text-primary transition-colors">
              Products
            </a>
            <a href="#about" className="block text-sm hover:text-primary transition-colors">
              About
            </a>
            <a href="#testimonials" className="block text-sm hover:text-primary transition-colors">
              Reviews
            </a>
            <a href="#contact" className="block text-sm hover:text-primary transition-colors">
              Contact
            </a>
            <div className="pt-4 space-y-2">
              <Button variant="ghost" size="sm" className="w-full">
                Sign In
              </Button>
              <Button size="sm" className="w-full">
                Create Book
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
