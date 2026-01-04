import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { config } from "@/lib/config"
import { getUserProfile } from "@/lib/auth-actions"

export default async function Home() {
  const isComingSoon = config.comingSoonMode
  const user = await getUserProfile()

  return (
    <main className="min-h-screen bg-[#f5f3ef]">
      <Header
        variant={isComingSoon ? 'coming-soon' : 'default'}
        user={user}
      />
      <Hero mode={isComingSoon ? 'coming-soon' : 'default'} />
    </main>
  )
}
