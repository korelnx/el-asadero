"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type OrderStatus = "new" | "in_progress" | "ready" | "done" | "cancelled" | "payment_failed";

interface OrderItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions: string | null;
  order_item_modifiers: Array<{ group_name: string; option_name: string; price_delta: number }>;
}

interface TrackedOrder {
  order_number: string;
  status: OrderStatus;
  type: "delivery" | "pickup";
  customer_name: string;
  estimated_ready_at: string | null;
  created_at: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  order_items: OrderItem[];
}

const STATUS_STEPS: { key: OrderStatus; label: string; description: string }[] = [
  { key: "new", label: "Order Received", description: "We have your order" },
  { key: "in_progress", label: "Preparing", description: "Kitchen is working on it" },
  { key: "ready", label: "Ready", description: "Your order is ready" },
  { key: "done", label: "Complete", description: "Enjoy your meal!" },
];

function statusIndex(status: OrderStatus) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

function TrackForm({ initialOrderNumber }: { initialOrderNumber: string }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoSearched, setAutoSearched] = useState(false);

  // Auto-search if order number is pre-filled and user enters phone
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError("Please enter your order number and phone number.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const params = new URLSearchParams({
        order_number: orderNumber.trim(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/orders/track?${params}`);
      if (!res.ok) {
        setError("Order not found. Double-check your order number and the phone number used at checkout.");
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setAutoSearched(true);
    }
  };

  void autoSearched;

  const isCancelled = order?.status === "cancelled" || order?.status === "payment_failed";
  const activeStep = order ? statusIndex(order.status) : -1;

  return (
    <div className="space-y-8">
      {/* Search form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Order Number</label>
          <input
            type="text"
            placeholder="AP-2026-01000"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            className="w-full px-4 py-4 bg-background border border-border focus:border-primary focus:outline-none font-mono placeholder:font-sans placeholder:text-foreground-muted/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            placeholder="Phone used at checkout"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-4 bg-background border border-border focus:border-primary focus:outline-none placeholder:text-foreground-muted/50"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-background py-4 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Looking up order…
            </span>
          ) : (
            "Track Order"
          )}
        </button>
      </form>

      {/* Order result */}
      {order && (
        <div className="space-y-6">
          <div className="border border-border p-6 space-y-6">
            {/* Order header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground-muted">Order</p>
                <p className="font-mono font-medium text-primary text-lg">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground-muted">
                  {order.type === "delivery" ? "Delivery" : "Pickup"}
                </p>
                <p className="text-sm">
                  {new Date(order.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Status pipeline */}
            {isCancelled ? (
              <div className="p-4 border border-red-500/30 bg-red-500/5 text-red-400 text-sm text-center">
                {order.status === "payment_failed"
                  ? "Payment failed — this order was not processed."
                  : "This order has been cancelled."}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current status banner */}
                <div className="p-4 bg-primary/5 border border-primary/20 text-center">
                  <p className="font-medium">{STATUS_STEPS[activeStep]?.label}</p>
                  <p className="text-sm text-foreground-muted mt-0.5">
                    {STATUS_STEPS[activeStep]?.description}
                  </p>
                  {order.estimated_ready_at && order.status !== "done" && (
                    <p className="text-xs text-primary mt-2">
                      Est. ready at{" "}
                      {new Date(order.estimated_ready_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                {/* Step indicators */}
                <div className="flex items-center">
                  {STATUS_STEPS.map((step, i) => {
                    const isDone = i < activeStep;
                    const isActive = i === activeStep;
                    return (
                      <div key={step.key} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-8 h-8 flex items-center justify-center border text-xs transition-colors ${
                              isActive
                                ? "border-primary bg-primary text-background"
                                : isDone
                                ? "border-primary text-primary"
                                : "border-border text-foreground-muted/30"
                            }`}
                          >
                            {isDone ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </div>
                          <p className={`text-xs mt-1.5 text-center leading-tight ${isActive || isDone ? "text-foreground" : "text-foreground-muted/40"}`}>
                            {step.label}
                          </p>
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`h-px flex-1 mx-1 mb-5 ${isDone ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order items */}
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-sm font-medium">Items</h3>
              {order.order_items.map((item, i) => (
                <div key={i} className="text-sm">
                  <div className="flex justify-between">
                    <span>
                      <span className="text-foreground-muted">{item.quantity}×</span>
                      <span className="ml-2">{item.item_name}</span>
                    </span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                  {item.order_item_modifiers.length > 0 && (
                    <p className="text-xs text-foreground-muted mt-0.5 ml-6">
                      {item.order_item_modifiers.map((m) => m.option_name).join(", ")}
                    </p>
                  )}
                  {item.special_instructions && (
                    <p className="text-xs text-foreground-muted/60 mt-0.5 ml-6 italic">
                      &ldquo;{item.special_instructions}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-foreground-muted">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-foreground-muted">
                  <span>Delivery</span>
                  <span>${order.delivery_fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-foreground-muted">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium pt-1 border-t border-border">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setOrder(null); setOrderNumber(""); setPhone(""); }}
            className="w-full py-3 border border-border hover:border-foreground-muted text-sm transition-colors"
          >
            Track another order
          </button>
        </div>
      )}
    </div>
  );
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get("order_number") ?? "";

  return <TrackForm initialOrderNumber={initialOrderNumber} />;
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Menu</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-primary flex items-center justify-center">
              <span className="text-primary text-sm font-serif">AP</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-serif mb-2">Track Your Order</h1>
          <p className="text-foreground-muted">
            Enter your order number and the phone number you used at checkout.
          </p>
        </div>

        <Suspense fallback={null}>
          <TrackPageContent />
        </Suspense>
      </main>
    </div>
  );
}
