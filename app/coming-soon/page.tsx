import { ComingSoonHero } from "@/components/coming-soon-hero"
import { WaitlistForm } from "@/components/waitlist-form"
import { ComingSoonHeader } from "@/components/coming-soon-header"
import { SocialLinks } from "@/components/social-links"

export default async function ComingSoonPage() {
  return (
    <>
      <main className="min-h-screen">
        <ComingSoonHeader />
        <ComingSoonHero />
        <WaitlistForm />
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[var(--color-primary-bg)] border-t border-[var(--color-border)] py-4 z-40">
        <SocialLinks />
      </footer>
    </>
  )
}
