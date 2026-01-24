"use client"

import { useState } from "react"
import { ArrowRight, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { AuthModal } from "./auth-modal"

interface HeroProps {
  user?: {
    firstName: string
  } | null
}

export function Hero({ user }: HeroProps) {
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleStartBook = () => {
    if (user) {
      router.push("/editor/new")
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 bg-[var(--color-primary-bg)]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl leading-tight text-[var(--color-primary-text)]">
            Your Story,
            <br />
            Well Kept.
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-[var(--color-primary-text)] font-light max-w-2xl mx-auto">
            For the moments worth
            <br />
            more than a scroll.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <button
              onClick={handleStartBook}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-primary-text)] px-8 py-4 rounded-full text-lg font-medium flex items-center gap-2 mx-auto transition-colors shadow-lg"
            >
              Start Your Book
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-primary-text)]">
          <ChevronUp className="w-6 h-6" />
          <p className="text-sm tracking-wide">Scroll</p>
        </div>
      </section>

      {/* Auth Modal with custom message */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          message="Log in to start creating your memories"
        />
      )}
    </>
  )
}
