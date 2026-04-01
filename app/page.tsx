"use client";

import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { LocationProvider } from "./context/LocationContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import { restaurant } from "@/config/restaurant";

export default function Home() {
  const { about, cta, phone, phoneRaw } = restaurant;
  return (
    <LocationProvider>
    <CartProvider>
      <OrderProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <Cart />
          <main className="pt-16 sm:pt-20">
            <Hero />
            <Menu />

            {/* About Section — two-column split */}
            <section id="about" className="py-16 sm:py-24 bg-background-secondary scroll-mt-16 sm:scroll-mt-20">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                  {/* Left: text */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rotate-45 bg-accent" />
                        <p className="text-accent font-medium tracking-widest uppercase text-xs">
                          Our Story
                        </p>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-light leading-tight">
                        {about.headline}
                        <span className="block text-primary">{about.headlineAccent}</span>
                      </h2>
                    </div>
                    <div className="space-y-4 text-foreground/70 leading-relaxed">
                      {about.body.map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                    <a
                      href="#menu"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors group"
                    >
                      Explore the menu
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>

                  {/* Right: team image */}
                  <div className="relative hidden lg:block lg:visible">
                    {/* Offset decorative borders */}
                    <div className="absolute -top-3 -left-3 w-full h-full border border-primary/20" />
                    <div className="absolute -bottom-3 -right-3 w-full h-full border border-accent/20" />
                    {/* Image */}
                    <div className="relative overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80"
                        alt="The El Asadero team"
                        className="w-full h-[460px] object-cover"
                      />
                      <div className="absolute inset-0 bg-background/10" />
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* CTA Section — bold banner with pattern */}
            <section className="hero-pattern relative bg-card border-y border-border overflow-hidden">

              <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

                  {/* Left: headline */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rotate-45 bg-accent" />
                      <span className="text-accent text-xs font-medium tracking-widest uppercase">Pickup & Go</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-light leading-tight">
                      {cta.headline}
                      <span className="block text-accent">{cta.headlineAccent}</span>
                    </h2>
                    <p className="text-foreground/60 max-w-sm">
                      {cta.subheading}
                    </p>
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col gap-4 lg:items-end shrink-0">
                    <a
                      href="#menu"
                      className="inline-flex items-center justify-center px-6 sm:px-10 py-4 bg-primary text-background font-medium hover:bg-primary-hover transition-colors w-full lg:w-auto"
                    >
                      Order Now
                    </a>
                    <a
                      href={`tel:${phoneRaw}`}
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-4 border border-accent text-foreground font-medium hover:bg-accent hover:text-background transition-colors w-full lg:w-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {phone}
                    </a>
                  </div>

                </div>
              </div>

            </section>
          </main>
          <Footer />
        </div>
      </OrderProvider>
    </CartProvider>
    </LocationProvider>
  );
}
