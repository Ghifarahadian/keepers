import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ProductShowcase() {
  const products = [
    {
      title: "Classic Photobook",
      price: "$29.99",
      image: "/elegant-hardcover-photobook.jpg",
    },
    {
      title: "Premium Magazine",
      price: "$39.99",
      image: "/premium-photo-magazine.jpg",
    },
    {
      title: "Luxury Album",
      price: "$49.99",
      image: "/luxury-photo-album.jpg",
    },
  ]

  return (
    <section id="products" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our collection of beautifully crafted photobooks and magazines
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {products.map((product, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-semibold text-lg">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{product.price}</span>
                    <Button size="sm">Create Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
