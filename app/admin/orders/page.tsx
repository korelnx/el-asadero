"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus, OrderType, PaymentMethod } from "@/types/database";

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
  new:            { label: "New",            dot: "bg-yellow-400", badge: "text-yellow-400 bg-yellow-400/10 ring-yellow-400/20", pulse: true  },
  in_progress:    { label: "In Progress",    dot: "bg-orange-400", badge: "text-orange-400 bg-orange-400/10 ring-orange-400/20", pulse: true  },
  ready:          { label: "Ready",          dot: "bg-primary",    badge: "text-primary bg-primary/10 ring-primary/20",          pulse: true  },
  done:           { label: "Done",           dot: "bg-foreground-muted", badge: "text-foreground-muted bg-foreground-muted/10 ring-foreground-muted/20" },
  cancelled:      { label: "Cancelled",      dot: "bg-foreground-muted", badge: "text-foreground-muted bg-foreground-muted/10 ring-foreground-muted/20" },
  payment_failed: { label: "Payment Failed", dot: "bg-red-500",    badge: "text-red-400 bg-red-400/10 ring-red-400/20"                        },
};

const FILTER_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All",         value: "all"         },
  { label: "New",         value: "new"         },
  { label: "In Progress", value: "in_progress" },
  { label: "Ready",       value: "ready"       },
  { label: "Done",        value: "done"        },
  { label: "Cancelled",   value: "cancelled"   },
];

const ACTIVE_STATUSES: OrderStatus[] = ["new", "in_progress", "ready"];

const IS_DEV = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(!IS_DEV);
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
    setUpdatingId(order.id);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: "cancelled" }),
    });
    await fetchOrders();
    setUpdatingId(null);
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders.filter(o => !["cancelled","payment_failed"].includes(o.status)).reduce((s, o) => s + o.total, 0);
  const activeCount = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;

  return (
    <div className="flex flex-col h-screen">
      {IS_DEV && (
        <div className="flex-shrink-0 px-8 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400 text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          Dev mode — Supabase not connected. No data will load.
        </div>
      )}
      {/* Header */}
      <div className="flex-shrink-0 h-16 border-b border-border flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-serif">Orders</h1>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs text-foreground-muted hover:text-primary transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 grid grid-cols-3 border-b border-border">
        <Stat label="Today's Orders" value={todayOrders.length.toString()} />
        <Stat label="Today's Revenue" value={`$${todayRevenue.toFixed(2)}`} border />
        <Stat label="Active" value={activeCount.toString()} border highlight={activeCount > 0} />
      </div>

      {/* Filter tabs */}
      <div className="flex-shrink-0 flex border-b border-border overflow-x-auto">
        {FILTER_TABS.map(tab => {
          const count = tab.value === "all" ? null : orders.filter(o => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-5 py-3.5 text-xs font-medium tracking-wide whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                filter === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {count != null && count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  filter === tab.value ? "bg-primary/20 text-primary" : "bg-foreground-muted/10 text-foreground-muted"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-foreground-muted text-sm gap-2">
            <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            No orders
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(order => (
              <OrderRow
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                isNew={newOrderIds.has(order.id)}
                onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                onAdvance={() => advanceStatus(order)}
                onCancel={() => cancelOrder(order)}
                updating={updatingId === order.id}
              />
            ))}
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
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ring-1 ${meta.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot} ${meta.pulse ? "animate-pulse" : ""}`} />
      {meta.label}
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

  const isDimmed = order.status === "done" || order.status === "cancelled" || order.status === "payment_failed";

  return (
    <div className={`transition-all duration-500 ${
      isNew ? "bg-primary/5" : expanded ? "bg-card" : "hover:bg-card/40"
    } ${isDimmed ? "opacity-60 hover:opacity-80" : ""}`}>
      <div
        className="flex items-center gap-4 px-8 py-5 cursor-pointer"
        onClick={onToggle}
      >
        {/* Alert dot for orders needing attention */}
        <div className="w-4 flex-shrink-0 flex items-center justify-center">
          {order.status === "new" ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
            </span>
          ) : (
            <div className={`w-0.5 h-8 rounded-full transition-colors ${
              isActive ? STATUS_META[order.status].dot : "bg-border"
            }`} />
          )}
        </div>

        {/* Order # + time */}
        <div className="w-28 flex-shrink-0">
          <p className="text-xs font-mono text-foreground-muted">{order.order_number}</p>
          <p className="text-xs text-foreground-muted/60 mt-0.5">{isToday ? timeStr : dateStr}</p>
        </div>

        {/* Customer with avatar */}
        <div className="w-40 flex-shrink-0 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-primary">
              {order.customer_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate leading-tight">{order.customer_name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {order.type === "delivery" ? (
                <svg className="w-2.5 h-2.5 text-foreground-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              ) : (
                <svg className="w-2.5 h-2.5 text-foreground-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                </svg>
              )}
              <span className="text-xs text-foreground-muted capitalize">{order.type}</span>
            </div>
          </div>
        </div>

        {/* Items — the star of the row */}
        <div className="flex-1 min-w-0 flex flex-wrap gap-1.5 items-center">
          {order.items.slice(0, 3).map(item => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 text-xs bg-card border border-border px-2 py-1 max-w-[180px]"
            >
              <span className="text-primary font-semibold flex-shrink-0">{item.quantity}×</span>
              <span className="text-foreground truncate">{item.item_name}</span>
            </span>
          ))}
          {order.items.length > 3 && (
            <span className="text-xs text-foreground-muted border border-border px-2 py-1">
              +{order.items.length - 3} more
            </span>
          )}
          {order.items.length === 0 && (
            <span className="text-xs text-foreground-muted/40 italic">No items</span>
          )}
        </div>

        {/* Total */}
        <div className="w-24 flex-shrink-0 text-right">
          <p className="text-base font-semibold">${order.total.toFixed(2)}</p>
          <p className="text-xs text-foreground-muted capitalize mt-0.5">{order.payment_method}</p>
        </div>

        {/* Quick action + status */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {nextStatus ? (
            <button
              onClick={onAdvance}
              disabled={updating}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 font-medium border transition-colors disabled:opacity-40 ${
                nextStatus === "done"
                  ? "border-green-500/40 text-green-400 hover:bg-green-400/10"
                  : nextStatus === "ready"
                  ? "border-primary/40 text-primary hover:bg-primary/10"
                  : "border-border text-foreground-muted hover:border-foreground-muted hover:text-foreground"
              }`}
            >
              {updating ? (
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[nextStatus].dot}`} />
              )}
              {STATUS_META[nextStatus].label}
            </button>
          ) : (
            <StatusBadge status={order.status} />
          )}
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-foreground-muted flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
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

            {/* Payment + notes */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-widest mb-3">Payment</p>
                <p className="text-sm capitalize">{order.payment_method}</p>
                {order.stripe_payment_status && (
                  <p className="text-xs text-foreground-muted capitalize mt-0.5">{order.stripe_payment_status}</p>
                )}
              </div>
              {order.special_instructions && (
                <div>
                  <p className="text-xs text-foreground-muted uppercase tracking-widest mb-2">Instructions</p>
                  <p className="text-sm text-foreground-muted italic">"{order.special_instructions}"</p>
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
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[nextStatus].dot}`} />
                    Mark as {STATUS_META[nextStatus].label}
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
