import { Button } from "@/components/ui/button"

export function About() {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Moments that last</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We bring your most cherished memories to life through thoughtfully crafted photobooks you can hold on
                  to forever.
                </p>
                <p>
                  Created to be flipped through often and proudly displayed, not tucked away. We make it easy to turn
                  your memories into something personal.
                </p>
              </div>
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">1M+ happy customers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">3,500+ trees planted</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">4.8/5 rating on Trustpilot</span>
                </div>
              </div>
              <Button size="lg" className="mt-4">
                Learn More About Us
              </Button>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img src="/photobook-memories-family.jpg" alt="About us" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
