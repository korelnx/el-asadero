"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useLocation } from "../context/LocationContext";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { restaurant, locations } from "@/config/restaurant";

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { selected, setSelected } = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setLocOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function checkAdmin(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single<{ role: string }>();
      setIsAdmin(data?.role === "admin");
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  function closeMobile() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/elasedro-logo.png" alt={restaurant.name} className="h-9 sm:h-12 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#menu" className="text-foreground-muted hover:text-foreground transition-colors text-sm tracking-wide">
              Menu
            </a>
            <a href="#about" className="text-foreground-muted hover:text-foreground transition-colors text-sm tracking-wide">
              About
            </a>
            <a href="#contact" className="text-foreground-muted hover:text-foreground transition-colors text-sm tracking-wide">
              Contact
            </a>
          </nav>

          {/* Desktop Location picker */}
          <div ref={locRef} className="relative hidden md:block">
            <button
              onClick={() => setLocOpen(v => !v)}
              className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span>{selected ? selected.name : "Select Location"}</span>
              <svg className={`w-3 h-3 transition-transform ${locOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {locOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-card border border-border shadow-2xl z-50">
                <p className="text-xs text-foreground-muted uppercase tracking-widest px-4 pt-3 pb-2">Select Location</p>
                {locations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => { setSelected(loc); setLocOpen(false); }}
                    className={`w-full text-left px-4 py-3 transition-colors border-t border-border first:border-t-0 ${
                      selected?.id === loc.id ? "text-primary bg-primary/5" : "text-foreground hover:bg-card/80"
                    }`}
                  >
                    <p className="text-sm font-medium">{loc.name}</p>
                    <p className="text-xs text-foreground-muted mt-0.5 truncate">{loc.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop auth */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                {isAdmin && (
                  <a
                    href="/admin/orders"
                    className="text-xs px-3 py-1.5 border border-primary/40 text-primary hover:border-primary transition-colors"
                  >
                    Dashboard
                  </a>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-xs text-foreground-muted hover:text-primary transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="hidden sm:inline-flex text-sm text-foreground-muted hover:text-primary transition-colors"
              >
                Sign in
              </a>
            )}

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 sm:gap-3 border border-border hover:border-primary px-3 sm:px-5 py-2 sm:py-2.5 transition-colors group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-foreground-muted group-hover:text-primary transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors hidden sm:inline">
                Cart
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-background text-xs font-medium w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden text-foreground-muted hover:text-foreground transition-colors p-1.5 -mr-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md shadow-xl">
          <div className="max-w-6xl mx-auto px-4 py-2 space-y-0.5">
            <a
              href="#menu"
              onClick={closeMobile}
              className="block py-3.5 text-foreground-muted hover:text-foreground transition-colors border-b border-border/50 text-sm"
            >
              Menu
            </a>
            <a
              href="#about"
              onClick={closeMobile}
              className="block py-3.5 text-foreground-muted hover:text-foreground transition-colors border-b border-border/50 text-sm"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={closeMobile}
              className="block py-3.5 text-foreground-muted hover:text-foreground transition-colors border-b border-border/50 text-sm"
            >
              Contact
            </a>

            {/* Location */}
            <div className="py-3 border-b border-border/50">
              <p className="text-xs text-foreground-muted uppercase tracking-widest mb-2">Location</p>
              <div className="space-y-0.5">
                {locations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => { setSelected(loc); closeMobile(); }}
                    className={`w-full text-left py-2 text-sm transition-colors flex items-center justify-between gap-2 ${
                      selected?.id === loc.id ? "text-primary" : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    <span>{loc.name}</span>
                    {selected?.id === loc.id && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth */}
            <div className="py-3">
              {user ? (
                <div className="flex items-center gap-6">
                  {isAdmin && (
                    <a href="/admin/orders" onClick={closeMobile} className="text-sm text-primary">
                      Dashboard
                    </a>
                  )}
                  <button
                    onClick={() => { handleSignOut(); closeMobile(); }}
                    className="text-sm text-foreground-muted hover:text-primary transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <a href="/login" onClick={closeMobile} className="text-sm text-foreground-muted hover:text-primary transition-colors">
                  Sign in
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
