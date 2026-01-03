"use client"

import { ArrowRight, ChevronUp } from "lucide-react"

interface HeroProps {
  mode?: 'default' | 'coming-soon'
}

export function Hero({ mode = 'default' }: HeroProps) {
  const isComingSoon = mode === 'coming-soon'

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 bg-[#f5f3ef]">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Main Headline */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-tight">
          Your Story,
          <br />
          Well Kept.
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-700 font-light max-w-2xl mx-auto">
          For the moments worth
          <br />
          more than a scroll.
        </p>

        {/* CTA - Button or Coming Soon Text */}
        {isComingSoon ? (
          <p className="text-4xl md:text-5xl text-gray-600 font-light pt-8">
            Coming Soon
          </p>
        ) : (
          <div className="pt-4">
            <button className="bg-[#d4786c] hover:bg-[#c26b5f] text-white px-8 py-4 rounded-full text-lg font-medium flex items-center gap-2 mx-auto transition-colors shadow-lg">
              Start Your Book
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Scroll Indicator - only show in default mode */}
      {!isComingSoon && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <ChevronUp className="w-6 h-6" />
          <p className="text-sm tracking-wide">Scroll</p>
        </div>
      )}
    </section>
  )
}
