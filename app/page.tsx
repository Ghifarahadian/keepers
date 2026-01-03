import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { config } from "@/lib/config"

export default function Home() {
  const isComingSoon = config.comingSoonMode

  return (
    <main className="min-h-screen bg-[#f5f3ef]">
      <Header variant={isComingSoon ? 'coming-soon' : 'default'} />
      <Hero mode={isComingSoon ? 'coming-soon' : 'default'} />
    </main>
  )
}
