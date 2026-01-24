import { LandingHeader } from "@/components/landing-header"
import { Hero } from "@/components/landing-hero"
import { getUserProfile } from "@/lib/auth-actions"

export default async function Home() {
  const user = await getUserProfile()

  return (
    <main className="min-h-screen bg-[var(--color-primary-bg)]">
      <LandingHeader user={user} />
      <Hero user={user} />
    </main>
  )
}
