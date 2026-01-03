import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ProductShowcase() {
  return (
    <section id="products" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Create Your Custom Photobook</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Turn your favorite memories into a beautifully crafted photobook
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="group hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src="/elegant-hardcover-photobook.jpg"
                  alt="Custom Photobook"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <h3 className="font-semibold text-2xl mb-2">Custom Photobook</h3>
                  <p className="text-muted-foreground">
                    Premium quality hardcover with lay-flat binding
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl font-bold">Starting at $29.99</span>
                </div>
                <Button size="lg" className="w-full text-lg py-6">
                  Create Your Photobook
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
