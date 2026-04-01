import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { restaurant } from "@/config/restaurant";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === "development";

  let displayName = "Dev Admin";

  if (!isDev) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login?redirect=/admin/orders");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single<{ role: string; full_name: string }>();

    if (profile?.role !== "admin") redirect("/");

    displayName = profile?.full_name || user.email || "Admin";
  }

  return (
    <>
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 border border-primary flex items-center justify-center">
              <span className="text-primary text-xs font-serif">{restaurant.initials}</span>
            </div>
            <span className="text-sm font-serif tracking-wide">El Asadero</span>
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-xs text-foreground-muted uppercase tracking-widest px-3 mb-3">Management</p>
          <NavLink href="/admin/orders" icon={<OrdersIcon />} label="Orders" />
          <NavLink href="/admin/menu" icon={<MenuIcon />} label="Menu" />
          <NavLink href="/admin/settings" icon={<SettingsIcon />} label="Settings" />
        </nav>

        {/* User */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-xs text-foreground-muted truncate">{displayName}</p>
          <a href="/api/auth/signout" className="text-xs text-foreground-muted hover:text-primary transition-colors mt-1 inline-block">
            Sign out
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
    <Toaster />
    </>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded text-sm text-foreground-muted hover:text-foreground hover:bg-card transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}

function OrdersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
