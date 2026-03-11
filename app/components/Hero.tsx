export default function Hero() {
  return (
    <section className="min-h-screen flex items-center bg-background">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <p className="text-primary font-medium tracking-widest uppercase text-sm">
              Authentic African Cuisine
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
              A Journey Through
              <span className="block text-primary">African Flavors</span>
            </h1>
            <p className="text-foreground-muted text-lg leading-relaxed mx-auto max-w-xl">
              Experience the rich culinary heritage of Africa. From the aromatic
              spices of Ethiopia to the bold flavors of West Africa, every dish
              tells a story of tradition and passion.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#menu"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
            >
              View Menu
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center px-8 py-4 border border-border text-foreground font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Our Story
            </a>
          </div>

          <div className="flex gap-12 pt-8 border-t border-border justify-center">
            <div>
              <div className="text-3xl font-light text-primary">15+</div>
              <div className="text-sm text-foreground-muted mt-1">African Countries</div>
            </div>
            <div>
              <div className="text-3xl font-light text-primary">50+</div>
              <div className="text-sm text-foreground-muted mt-1">Signature Dishes</div>
            </div>
            <div>
              <div className="text-3xl font-light text-primary">10k+</div>
              <div className="text-sm text-foreground-muted mt-1">Happy Guests</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
