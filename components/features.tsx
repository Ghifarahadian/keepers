import { Sparkles, BookOpen, Gift } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Sparkles,
      title: "Printed to Perfection",
      description: "Sharp photos & true colours on thick, luxurious paper",
    },
    {
      icon: BookOpen,
      title: "Crafted to Last",
      description: "Premium hardcover with perfect lay-flat binding",
    },
    {
      icon: Gift,
      title: "Luxury in Every Detail",
      description: "Thoughtfully designed with premium gift packaging",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-xl">{feature.title}</h3>
              <p className="text-muted-foreground text-balance">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
