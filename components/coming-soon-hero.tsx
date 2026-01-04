"use client"

import { ChevronDown } from "lucide-react"

export function ComingSoonHero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#f5f3ef]">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-tight">
          Your Story,
          <br />
          Well Kept.
        </h1>

        <p className="text-lg md:text-xl text-gray-700 font-light pt-4">
          For the moments worth more than a scroll
        </p>

        <p className="text-4xl md:text-5xl text-gray-600 font-light pt-8">
          Coming Soon
        </p>

        {/* Scroll to waitlist */}
        <a
          href="#waitlist"
          className="inline-flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors pt-12"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
          <p className="text-sm tracking-wide">Join our waitlist</p>
        </a>
      </div>
    </section>
  )
}
