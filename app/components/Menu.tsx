"use client";

import { useState } from "react";
import { useCart, type MenuItem } from "../context/CartContext";
import { CATEGORIES, MENU_ITEMS } from "@/config/menu";

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  return (
    <div className="group bg-card border border-border hover:border-primary/30 transition-all">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-36 object-cover border-b border-border"
        />
      ) : (
        <div className="w-full h-36 border-b border-border bg-card flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/elasedro-logo.png" alt="El Asadero" className="h-10 w-auto opacity-20" />
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-serif text-lg leading-snug">{item.name}</h3>
            {item.is_featured && (
              <span className="text-xs text-accent font-medium tracking-wide">Featured</span>
            )}
          </div>
          <span className="text-primary font-medium whitespace-nowrap">
            ${item.price.toFixed(2)}
          </span>
        </div>
        {item.description && (
          <p className="text-foreground-muted text-sm leading-relaxed">
            {item.description}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary/80 rounded-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => onAdd(item)}
          className="w-full border border-border hover:border-primary hover:bg-primary hover:text-background py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add to Order
        </button>
      </div>
    </div>
  );
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id);
  const { addItem, setIsOpen } = useCart();

  const handleAdd = (item: MenuItem) => {
    addItem(item, [], "");
    setIsOpen(true);
  };

  const filteredItems = MENU_ITEMS.filter((item) => item.category_id === activeCategory);
  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <>
      <section id="menu" className="py-16 sm:py-24 bg-background-secondary scroll-mt-16 sm:scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16 space-y-4">
            <p className="text-primary font-medium tracking-widest uppercase text-sm">
              Our Menu
            </p>
            <h2 className="text-4xl md:text-5xl font-light">Fresh Every Day</h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Authentic Mexican dishes made with fresh ingredients. Available for dine-in, takeout, and delivery.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10 sm:mb-16">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm transition-all ${
                  activeCategory === category.id
                    ? "bg-primary text-background"
                    : "border border-border text-foreground-muted hover:border-primary hover:text-foreground"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {activeCat?.description && (
            <div className="text-center mb-8">
              <p className="text-foreground-muted">{activeCat.description}</p>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <p className="text-center text-foreground-muted py-12">No items in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </div>
      </section>

    </>
  );
}
