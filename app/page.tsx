import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { ProductShowcase } from "@/components/product-showcase"
import { About } from "@/components/about"
import { Testimonials } from "@/components/testimonials"
import { Social } from "@/components/social"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ProductShowcase />
      <Features />
      <About />
      <Testimonials />
      <Social />
      <Footer />
    </div>
  )
}
