"use client";

import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Footer from "./components/Footer";

export default function Home() {
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
                    A Taste of Home,
                    <span className="block text-primary">Far From Home</span>
                  </h2>
                </div>

                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    African Paradise was born from a deep love for the vibrant
                    cuisines of Africa. Our restaurant brings together the diverse
                    culinary traditions of the continent under one roof.
                  </p>
                  <p>
                    From hearty stews to fresh juices, each dish we serve is a
                    celebration of African heritage. We source authentic ingredients
                    to ensure every bite transports you home.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                  <div>
                    <div className="text-3xl font-light text-primary">52+</div>
                    <div className="text-sm text-foreground-muted mt-1">Menu Items</div>
                  </div>
                  <div>
                    <div className="text-3xl font-light text-primary">3</div>
                    <div className="text-sm text-foreground-muted mt-1">Daily Menus</div>
                  </div>
                  <div>
                    <div className="text-3xl font-light text-primary">Fresh</div>
                    <div className="text-sm text-foreground-muted mt-1">Daily Made</div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-card border-y border-border">
              <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-light">
                  Ready to Experience
                  <span className="block text-primary">African Cuisine?</span>
                </h2>
                <p className="text-foreground-muted max-w-xl mx-auto">
                  Order online for delivery or pickup. Fresh, authentic dishes
                  ready in minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#menu"
                    className="inline-flex items-center justify-center px-8 py-4 bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
                  >
                    Order Now
                  </a>
                  <a
                    href="tel:5551234567"
                    className="inline-flex items-center justify-center px-8 py-4 border border-border text-foreground font-medium hover:border-primary transition-colors"
                  >
                    Call (555) 123-4567
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
