import { Header } from "@/components/header"
import { Hero } from "@/components/landing-hero"
import { getUserProfile } from "@/lib/auth-actions"

export default async function Home() {
  const user = await getUserProfile()

  return (
    <main className="min-h-screen bg-[#f5f3ef]">
      <Header variant="default" user={user} />
      <Hero />
    </main>
  )
}
