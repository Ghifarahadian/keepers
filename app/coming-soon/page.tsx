import { ComingSoonHero } from "@/components/coming-soon-hero"
import { WaitlistForm } from "@/components/waitlist-form"
import { Header } from "@/components/header"
import { SocialLinks } from "@/components/social-links"
import { getUserProfile } from "@/lib/auth-actions"

export default async function ComingSoonPage() {
  const user = await getUserProfile()

  return (
    <>
      <main className="min-h-screen">
        <Header variant="coming-soon" user={user} />
        <ComingSoonHero />
        <WaitlistForm />
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#f5f3ef] border-t border-gray-200 py-4 z-40">
        <SocialLinks />
      </footer>
    </>
  )
}
