"use client";

import { useState, useEffect } from "react";
import { useCart, type MenuItem } from "../context/CartContext";

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
}

function MenuCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();

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
          <div className="flex flex-col items-center gap-1.5 opacity-20">
            <div className="w-8 h-8 border border-primary flex items-center justify-center">
              <span className="text-primary text-xs font-serif">AP</span>
            </div>
            <span className="text-primary text-xs font-serif tracking-widest uppercase">African Paradise</span>
          </div>
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-serif text-lg leading-snug">{item.name}</h3>
            {item.is_featured && (
              <span className="text-xs text-primary font-medium tracking-wide">Featured</span>
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
            {item.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary/80 rounded-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => addItem(item)}
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/menu", { cache: "no-store" })
      .then(res => res.json())
      .then(({ categories: cats, items: its, error: err }) => {
        if (err) { setError(err); return; }
        setCategories(cats ?? []);
        setItems(its ?? []);
        if (cats?.length) setActiveCategory(cats[0].id);
      })
      .catch(() => setError("Failed to load menu"))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter(item => item.category_id === activeCategory);
  const activeCat = categories.find(c => c.id === activeCategory);

  return (
    <section id="menu" className="py-24 bg-background-secondary scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-primary font-medium tracking-widest uppercase text-sm">
            Our Menu
          </p>
          <h2 className="text-4xl md:text-5xl font-light">
            All Day Dining
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto">
            Fresh, authentic dishes made with love. Available for dine-in, takeout, and delivery.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-foreground-muted">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading menu…
          </div>
        ) : error ? (
          <p className="text-center text-foreground-muted py-16">{error}</p>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-16">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 text-sm transition-all ${
                    activeCategory === category.id
                      ? "bg-primary text-background"
                      : "border border-border text-foreground-muted hover:border-primary hover:text-foreground"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Category Description */}
            {activeCat?.description && (
              <div className="text-center mb-8">
                <p className="text-foreground-muted">{activeCat.description}</p>
              </div>
            )}

            {/* Menu Grid */}
            {filteredItems.length === 0 ? (
              <p className="text-center text-foreground-muted py-12">No items available in this category.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
