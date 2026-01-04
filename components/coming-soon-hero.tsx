"use client"

export function ComingSoonHero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--color-primary-bg)]">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-6xl md:text-7xl lg:text-8xl leading-tight text-[var(--color-primary-text)]">
          Your Stories,
          <br />
          Well-Kept.
        </h1>

        <p className="text-lg md:text-xl text-[var(--color-primary-text)] font-light pt-4">
          For the moments worth more than a scroll
        </p>

        <p className="text-4xl md:text-5xl text-[var(--color-primary-text)] font-light pt-8">
          Coming Soon
        </p>

        {/* Join waitlist button */}
        <div className="pt-4">
          <a
            href="#waitlist"
            className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-primary-text)] px-8 py-3 rounded-full font-medium transition-colors"
          >
            Join our waitlist
          </a>
        </div>
      </div>
    </section>
  )
}
