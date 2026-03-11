import { restaurant } from "@/config/restaurant";

export default function Hero() {
  const { tagline, hero } = restaurant;
  return (
    <section className="min-h-screen flex items-center bg-background">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <p className="text-primary font-medium tracking-widest uppercase text-sm">
              {tagline}
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
              {hero.headline}
              <span className="block text-primary">{hero.headlineAccent}</span>
            </h1>
            <p className="text-foreground-muted text-lg leading-relaxed mx-auto max-w-xl">
              {hero.subheading}
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
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-light text-primary">{stat.value}</div>
                <div className="text-sm text-foreground-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
