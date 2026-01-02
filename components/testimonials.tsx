import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Rebecca Stinson",
      text: "I absolutely love the two books I had made! The quality and style are amazing. The photos from my iPhone 16 look incredible!",
      rating: 5,
    },
    {
      name: "Medeea Mihăiescu",
      text: "Thank you for this beautiful album! The photos are excellently printed and the design is beautiful. It is more than just a collection of photos.",
      rating: 5,
    },
    {
      name: "Nicolina",
      text: "My book arrived in great condition and quality. Beautiful hard cover and pages feel lovely. A beautiful addition for my coffee table!",
      rating: 5,
    },
    {
      name: "Tiago Veloso",
      text: "By far the greatest and most easy album making website! The quality and the size and everything about the albums is PERFECT.",
      rating: 5,
    },
    {
      name: "Lauren Silverstein",
      text: "I have been trying for years to figure out what to do with all of my travel photos. I received my first book and already ordered two more!",
      rating: 5,
    },
    {
      name: "Olivia",
      text: "THE PRODUCT MATCHES THE AD!! The templates are so easy to work with and the premade covers are to die for. Can't say enough good things!",
      rating: 5,
    },
  ]

  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by 1M+ customers</h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Rated excellent</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span>4.8/5 stars on Trustpilot</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                <p className="font-semibold text-sm">{testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
