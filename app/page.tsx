"use client";

import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import { restaurant } from "@/config/restaurant";

export default function Home() {
  const { about, cta, phone, phoneRaw } = restaurant;
  return (
    <CartProvider>
      <OrderProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <Cart />
          <main className="pt-20">
            <Hero />
            <Menu />

            {/* About Section */}
            <section id="about" className="py-24 bg-background scroll-mt-20">
              <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
                <div className="space-y-4">
                  <p className="text-primary font-medium tracking-widest uppercase text-sm">
                    Our Story
                  </p>
                  <h2 className="text-4xl md:text-5xl font-light leading-tight">
                    {about.headline}
                    <span className="block text-primary">{about.headlineAccent}</span>
                  </h2>
                </div>

                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  {about.body.map((p, i) => <p key={i}>{p}</p>)}
                </div>

                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                  {about.stats.map((s) => (
                    <div key={s.label}>
                      <div className="text-3xl font-light text-primary">{s.value}</div>
                      <div className="text-sm text-foreground-muted mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-card border-y border-border">
              <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-light">
                  {cta.headline}
                  <span className="block text-primary">{cta.headlineAccent}</span>
                </h2>
                <p className="text-foreground-muted max-w-xl mx-auto">
                  {cta.subheading}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#menu"
                    className="inline-flex items-center justify-center px-8 py-4 bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
                  >
                    Order Now
                  </a>
                  <a
                    href={`tel:${phoneRaw}`}
                    className="inline-flex items-center justify-center px-8 py-4 border border-border text-foreground font-medium hover:border-primary transition-colors"
                  >
                    Call {phone}
                  </a>
                </div>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      </OrderProvider>
    </CartProvider>
  );
}
