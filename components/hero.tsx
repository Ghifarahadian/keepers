import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge variant="secondary" className="text-xs font-medium">
            🛍️ Black Friday Sale - Up to 70% Off
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
            Your moments,
            <br />
            <span className="text-primary">forever kept</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Custom keepsakes that turn your memories into something real
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-base px-8">
              Create Custom Photobook
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div>⚡ Fast Shipping</div>
            <div>✓ 30-Day Guarantee</div>
            <div>★ 4.8/5 Stars</div>
          </div>
        </div>
      </div>
    </section>
  )
}
