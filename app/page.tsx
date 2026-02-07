import { LandingHeader } from "@/components/landing-header"
import { Hero } from "@/components/landing-hero"
import { SocialLinks } from "@/components/social-links"
import { getUserProfile } from "@/lib/auth-actions"

export default async function Home() {
  const user = await getUserProfile()

  return (
    <>
      <main className="min-h-screen bg-[var(--color-primary-bg)]">
        <LandingHeader user={user} />
        <Hero user={user} />
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[var(--color-primary-bg)] border-t border-[var(--color-border)] py-4 z-40">
        <SocialLinks />
      </footer>
    </>
  )
}
