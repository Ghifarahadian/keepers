export function Social() {
  const images = [
    "/vacation-photobook.jpg",
    "/wedding-photobook.jpg",
    "/travel-memories.png",
    "/vintage-family-album.png",
    "/graduation-photobook.jpg",
    "/baby-album.png",
    "/adventure-photobook.jpg",
    "/birthday-memories.jpg",
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Created by you, loved by us</h2>
          <p className="text-muted-foreground">Join our community and share your memories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {images.map((image, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`Customer photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Find us on social</p>
          <div className="flex items-center justify-center gap-6">
            <a href="#" className="text-sm hover:text-primary transition-colors">
              Instagram
            </a>
            <a href="#" className="text-sm hover:text-primary transition-colors">
              Facebook
            </a>
            <a href="#" className="text-sm hover:text-primary transition-colors">
              TikTok
            </a>
            <a href="#" className="text-sm hover:text-primary transition-colors">
              Pinterest
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
