"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus, OrderType, PaymentMethod } from "@/types/database";
import { MENU_ITEMS } from "@/config/menu";

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  type: OrderType;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: { street: string; city: string; unit?: string } | null;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  tip: number;
  total: number;
  payment_method: PaymentMethod;
  stripe_payment_status: string | null;
  special_instructions: string | null;
  created_at: string;
  items: OrderItem[];
}

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  new:            "in_progress",
  in_progress:    "ready",
  ready:          "done",
  done:           null,
  cancelled:      null,
  payment_failed: null,
};

const STATUS_META: Record<OrderStatus, { label: string; dot: string; badge: string; pulse?: boolean }> = {
  new:            { label: "New",            dot: "bg-blue-400",    badge: "bg-blue-500 text-white",           pulse: true },
  in_progress:    { label: "In Progress",    dot: "bg-amber-400",   badge: "bg-amber-500 text-white",          pulse: true },
  ready:          { label: "Ready",          dot: "bg-emerald-400", badge: "bg-emerald-600 text-white",        pulse: true },
  done:           { label: "Done",           dot: "bg-gray-400",    badge: "bg-gray-200 text-gray-600"                     },
  cancelled:      { label: "Cancelled",      dot: "bg-gray-400",    badge: "bg-gray-200 text-gray-600"                     },
  payment_failed: { label: "Payment Failed", dot: "bg-red-400",     badge: "bg-red-500 text-white"                         },
};

const STATUS_PRIORITY: Record<OrderStatus, number> = {
  new: 0, in_progress: 1, ready: 2, done: 3, cancelled: 4, payment_failed: 5,
};

const ACTIVE_STATUSES: OrderStatus[] = ["new", "in_progress", "ready"];

const IS_DEV = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

// Build a mock order item from a real menu item id + quantity
function mi(menuId: string, qty: number, idx: number): OrderItem {
  const item = MENU_ITEMS.find(i => i.id === menuId)!;
  return { id: `mi-${idx}`, item_name: item.name, quantity: qty, unit_price: item.price, subtotal: +(item.price * qty).toFixed(2) };
}

function buildMockOrders(): Order[] { const now = Date.now(); return [
  {
    id: "m1", order_number: "AP-2026-1041", status: "new", type: "pickup",
    customer_name: "Marcus Rivera", customer_email: "marcus.rivera@gmail.com", customer_phone: "614-308-4471",
    delivery_address: null, subtotal: 46.47, delivery_fee: 0, tax: 4.07, tip: 0, total: 50.54,
    payment_method: "cash", stripe_payment_status: null, special_instructions: null,
    created_at: new Date(now - 4 * 60000).toISOString(),
    items: [
      mi("app-1",  1, 1),  // Asadero Sampler     $24.99
      mi("sf-2",   1, 2),  // Street Tacos (3)    $15.99
      mi("dip-5",  1, 3),  // Cheese Dip           $5.49
    ],
  },
  {
    id: "m2", order_number: "AP-2026-1040", status: "in_progress", type: "delivery",
    customer_name: "Sofia Mendez", customer_email: "sofia.m@email.com", customer_phone: "614-774-9902",
    delivery_address: { street: "288 Brice Rd", city: "Reynoldsburg" }, subtotal: 73.46, delivery_fee: 4.99, tax: 6.43, tip: 6.00, total: 90.88,
    payment_method: "stripe", stripe_payment_status: "succeeded", special_instructions: "Leave at door",
    created_at: new Date(now - 22 * 60000).toISOString(),
    items: [
      mi("faj-6",  1, 4),  // Flaming Cheese Fajitas  $27.99
      mi("bur-1",  2, 5),  // Asadero Burrito ×2      $39.98
      mi("dip-6",  1, 6),  // Guacamole Dip            $5.49
    ],
  },
  {
    id: "m3", order_number: "AP-2026-1039", status: "ready", type: "pickup",
    customer_name: "James Okafor", customer_email: "j.okafor@gmail.com", customer_phone: "614-512-3388",
    delivery_address: null, subtotal: 61.97, delivery_fee: 0, tax: 5.42, tip: 0, total: 67.39,
    payment_method: "stripe", stripe_payment_status: "succeeded", special_instructions: null,
    created_at: new Date(now - 41 * 60000).toISOString(),
    items: [
      mi("mw-17",  1, 7),  // El Asadero Molcajete  $33.99
      mi("sf-4",   1, 8),  // Bone Marrow Taco (3)  $21.99
      mi("app-9",  1, 9),  // Mexican Corn           $5.99
    ],
  },
  {
    id: "m4", order_number: "AP-2026-1038", status: "done", type: "delivery",
    customer_name: "Aisha Thompson", customer_email: "aisha.t@hotmail.com", customer_phone: "614-889-6640",
    delivery_address: { street: "1450 Gender Rd", city: "Reynoldsburg" }, subtotal: 55.97, delivery_fee: 4.99, tax: 4.90, tip: 5.00, total: 70.86,
    payment_method: "stripe", stripe_payment_status: "succeeded", special_instructions: null,
    created_at: new Date(now - 95 * 60000).toISOString(),
    items: [
      mi("nac-6",  1, 10), // Fiesta Nachos         $20.99
      mi("bur-5",  1, 11), // King Kong Burrito     $21.99
      mi("app-10", 1, 12), // Table Side Guacamole  $12.99
    ],
  },
  {
    id: "m5", order_number: "AP-2026-1037", status: "done", type: "pickup",
    customer_name: "Carlos Vega", customer_email: "c.vega@email.com", customer_phone: "614-201-7753",
    delivery_address: null, subtotal: 43.97, delivery_fee: 0, tax: 3.85, tip: 0, total: 47.82,
    payment_method: "cash", stripe_payment_status: null, special_instructions: "Extra hot sauce please",
    created_at: new Date(now - 3 * 3600000).toISOString(),
    items: [
      mi("faj-7",  1, 13), // Parrillada       $31.99
      mi("app-9",  2, 14), // Mexican Corn ×2  $11.98
    ],
  },
]; }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() => IS_DEV ? buildMockOrders() : []);
  const [loading, setLoading] = useState(!IS_DEV);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    if (IS_DEV) return;
    const res = await fetch("/api/admin/orders");
    if (!res.ok) {
      const { error } = await res.json();
      console.error("Failed to fetch orders:", error);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrders(prev => {
      const prevIds = new Set(prev.map((o: Order) => o.id));
      const incoming = data.map((o: any) => ({ ...o, items: o.order_items ?? [] }));
      const fresh = incoming.filter((o: Order) => !prevIds.has(o.id)).map((o: Order) => o.id);
      if (fresh.length) {
        setNewOrderIds(ids => new Set([...ids, ...fresh]));
        setTimeout(() => setNewOrderIds(ids => {
          const next = new Set(ids);
          fresh.forEach((id: string) => next.delete(id));
          return next;
        }), 2000);
      }
      return incoming;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (IS_DEV) return;
    fetchOrders();
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders, supabase]);

  async function advanceStatus(order: Order) {
    const next = STATUS_FLOW[order.status];
    if (!next) return;
    if (IS_DEV) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o));
      return;
    }
    setUpdatingId(order.id);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: next }),
    });
    await fetchOrders();
    setUpdatingId(null);
  }

  async function cancelOrder(order: Order) {
    if (!confirm(`Cancel order ${order.order_number}?`)) return;
    if (IS_DEV) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "cancelled" } : o));
      return;
    }
    setUpdatingId(order.id);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: "cancelled" }),
    });
    await fetchOrders();
    setUpdatingId(null);
  }

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
  const activeCount = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;

  const activeOrders = orders
    .filter(o => ACTIVE_STATUSES.includes(o.status))
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const resolvedOrders = orders
    .filter(o => !ACTIVE_STATUSES.includes(o.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 h-16 border-b border-border flex items-center justify-between px-8">
        <h1 className="text-lg font-serif">Orders</h1>
        <button
          onClick={async () => { setRefreshing(true); await fetchOrders(); setRefreshing(false); }}
          disabled={refreshing}
          className="text-xs text-foreground-muted hover:text-primary transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 grid grid-cols-2 border-b border-border">
        <Stat label="Today's Orders" value={todayOrders.length.toString()} />
        <Stat label="Active" value={activeCount.toString()} border highlight={activeCount > 0} />
      </div>

      {/* Orders list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-2 text-foreground-muted text-sm">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-foreground-muted text-sm gap-2">
            <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            No orders
          </div>
        ) : (
          <div>
            {activeOrders.length > 0 && (
              <div>
                <div className="px-8 py-2.5 bg-background-secondary border-b border-border flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground uppercase tracking-widest">Active</span>
                  <span className="text-xs bg-foreground/10 text-foreground px-1.5 py-0.5 rounded-full font-medium">{activeOrders.length}</span>
                </div>
                <div className="divide-y divide-border">
                  {activeOrders.map(order => (
                    <OrderRow key={order.id} order={order} expanded={expandedId === order.id}
                      isNew={newOrderIds.has(order.id)}
                      onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      onAdvance={() => advanceStatus(order)} onCancel={() => cancelOrder(order)}
                      updating={updatingId === order.id} />
                  ))}
                </div>
              </div>
            )}
            {resolvedOrders.length > 0 && (
              <div>
                <div className="px-8 py-2.5 bg-background-secondary border-y border-border flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground-muted uppercase tracking-widest">Completed</span>
                  <span className="text-xs bg-foreground-muted/10 text-foreground-muted px-1.5 py-0.5 rounded-full font-medium">{resolvedOrders.length}</span>
                </div>
                <div className="divide-y divide-border">
                  {resolvedOrders.map(order => (
                    <OrderRow key={order.id} order={order} expanded={expandedId === order.id}
                      isNew={newOrderIds.has(order.id)}
                      onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      onAdvance={() => advanceStatus(order)} onCancel={() => cancelOrder(order)}
                      updating={updatingId === order.id} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, border, highlight }: { label: string; value: string; border?: boolean; highlight?: boolean }) {
  return (
    <div className={`px-8 py-5 ${border ? "border-l border-border" : ""}`}>
      <p className="text-xs text-foreground-muted uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-light mt-1 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const configs: Record<OrderStatus, { label: string; cls: string; icon: ReactNode }> = {
    new: {
      label: "New",
      cls: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/40",
      icon: (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
        </span>
      ),
    },
    in_progress: {
      label: "In Progress",
      cls: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40",
      icon: (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
        </span>
      ),
    },
    ready: {
      label: "Ready",
      cls: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40",
      icon: (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
      ),
    },
    done: {
      label: "Done",
      cls: "bg-white/5 text-white/40 ring-1 ring-white/10",
      icon: (
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-white/5 text-white/30 ring-1 ring-white/10",
      icon: (
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    payment_failed: {
      label: "Payment Failed",
      cls: "bg-red-500/15 text-red-400 ring-1 ring-red-500/40",
      icon: (
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H2.645c-1.73 0-2.813-1.874-1.948-3.374L10.052 3.378c.866-1.5 3.032-1.5 3.898 0L21.303 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
  };

  const { label, cls, icon } = configs[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  );
}

function OrderRow({
  order, expanded, isNew, onToggle, onAdvance, onCancel, updating,
}: {
  order: Order;
  expanded: boolean;
  isNew: boolean;
  onToggle: () => void;
  onAdvance: () => void;
  onCancel: () => void;
  updating: boolean;
}) {
  const nextStatus = STATUS_FLOW[order.status];
  const time = new Date(order.created_at);
  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString([], { month: "short", day: "numeric" });
  const isToday = time.toDateString() === new Date().toDateString();
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const elapsedMins = Math.floor((Date.now() - time.getTime()) / 60000);
  const isDone = order.status === "done";
  const isCancelled = order.status === "cancelled" || order.status === "payment_failed";

  return (
    <div className={`transition-all duration-500 ${
      isNew ? "bg-primary/5" :
      isCancelled ? "bg-background-secondary/60" :
      expanded ? "bg-card" : "hover:bg-card/40"
    }`}>
      <div className="flex items-center gap-4 px-8 py-5 cursor-pointer" onClick={onToggle}>
        {/* Status indicator */}
        <div className="w-4 flex-shrink-0 flex items-center justify-center">
          {isDone ? (
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : isCancelled ? (
            <svg className="w-4 h-4 text-foreground-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span className={`w-2 h-2 rounded-full ${STATUS_META[order.status].dot}`} />
          )}
        </div>

        {/* Time + order # */}
        <div className="w-24 flex-shrink-0">
          <p className={`text-sm font-semibold tabular-nums ${isCancelled ? "text-foreground-muted/40" : "text-foreground"}`}>
            {isActive && elapsedMins < 60
              ? (elapsedMins < 1 ? "just now" : `${elapsedMins}m ago`)
              : (isToday ? timeStr : dateStr)}
          </p>
          <p className={`text-xs mt-0.5 ${isCancelled ? "text-foreground-muted/30 line-through" : "text-foreground-muted"}`}>
            #{parseInt(order.order_number.split("-").at(-1) ?? "0", 10)}
          </p>
        </div>

        {/* Customer */}
        <div className="w-36 flex-shrink-0 min-w-0">
          <p className="text-sm font-medium truncate">{order.customer_name}</p>
          <span className="text-xs text-foreground-muted capitalize">{order.type}</span>
        </div>

        {/* Items */}
        <div className="flex-1 min-w-0 flex flex-wrap gap-1.5 items-center">
          {order.items.slice(0, 3).map(item => (
            <span key={item.id} className="inline-flex items-center gap-1 text-xs bg-card border border-border px-2 py-1 max-w-[180px]">
              <span className="text-primary font-semibold flex-shrink-0">{item.quantity}×</span>
              <span className="text-foreground truncate">{item.item_name}</span>
            </span>
          ))}
          {order.items.length > 3 && (
            <span className="text-xs text-foreground-muted border border-border px-2 py-1">+{order.items.length - 3} more</span>
          )}
          {order.items.length === 0 && (
            <span className="text-xs text-foreground-muted/40 italic">No items</span>
          )}
        </div>

        {/* Total */}
        <div className="w-24 flex-shrink-0 text-right">
          <p className="text-base font-semibold">${order.total.toFixed(2)}</p>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          <StatusBadge status={order.status} />
        </div>

        {/* Chevron */}
        <svg className={`w-4 h-4 text-foreground-muted flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-8 pb-6 space-y-5 border-t border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
            {/* Customer */}
            <div className="space-y-1">
              <p className="text-xs text-foreground-muted uppercase tracking-widest mb-3">Customer</p>
              <p className="text-sm font-medium">{order.customer_name}</p>
              <p className="text-sm text-foreground-muted">{order.customer_email}</p>
              <p className="text-sm text-foreground-muted">{order.customer_phone}</p>
              {order.delivery_address && (
                <p className="text-sm text-foreground-muted mt-2">
                  {order.delivery_address.street}
                  {order.delivery_address.unit ? `, ${order.delivery_address.unit}` : ""}
                  {", "}{order.delivery_address.city}
                </p>
              )}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-widest mb-3">Items</p>
              <div className="space-y-1.5">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground-muted">
                      <span className="text-foreground font-medium">{item.quantity}×</span> {item.item_name}
                    </span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1">
                <div className="flex justify-between text-xs text-foreground-muted">
                  <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
                </div>
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between text-xs text-foreground-muted">
                    <span>Delivery</span><span>${order.delivery_fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-foreground-muted">
                  <span>Tax</span><span>${order.tax.toFixed(2)}</span>
                </div>
                {order.tip > 0 && (
                  <div className="flex justify-between text-xs text-foreground-muted">
                    <span>Tip</span><span>${order.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold pt-1">
                  <span>Total</span><span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-widest mb-3">Payment</p>
              <p className="text-sm capitalize">{order.payment_method}</p>
              {order.stripe_payment_status && (
                <p className="text-xs text-foreground-muted capitalize mt-0.5">{order.stripe_payment_status}</p>
              )}
              {order.special_instructions && (
                <div className="mt-4">
                  <p className="text-xs text-foreground-muted uppercase tracking-widest mb-1">Note</p>
                  <p className="text-sm text-foreground-muted">{order.special_instructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            {nextStatus && (
              <button
                onClick={onAdvance}
                disabled={updating}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-background text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating…
                  </>
                ) : (
                  <>
                    {({ in_progress: "Start Order", ready: "Mark Ready", done: "Complete" } as Record<string, string>)[nextStatus] ?? `Mark as ${STATUS_META[nextStatus].label}`}
                  </>
                )}
              </button>
            )}
            {!["cancelled", "done", "payment_failed"].includes(order.status) && (
              <button
                onClick={onCancel}
                disabled={updating}
                className="px-5 py-2 border border-border text-sm text-foreground-muted hover:border-red-400 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
