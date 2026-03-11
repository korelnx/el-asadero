"use client";

import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

    // getSession reads from cookies instantly — no network, no flash
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 border border-primary flex items-center justify-center">
              <span className="text-primary text-lg font-serif">AP</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-serif tracking-wide">African Paradise</h1>
            </div>
          </a>

          {/* Navigation */}
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

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Auth */}
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
              className="relative flex items-center gap-3 border border-border hover:border-primary px-5 py-2.5 transition-colors group"
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
          </div>
        </div>
      </div>
    </header>
  );
}
