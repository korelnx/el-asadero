"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { restaurant } from "@/config/restaurant";

function ConfirmationContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderNumber = params.get("number") ?? "—";
  const orderType = params.get("type") ?? "pickup";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg">{restaurant.name}</Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pt-16 pb-24">
        <div className="w-full max-w-lg space-y-8">

          {/* Check + headline */}
          <div className="space-y-4">
            <div className="w-12 h-12 border border-primary flex items-center justify-center">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-serif font-light">Order confirmed.</h1>
              <p className="text-foreground-muted mt-2">
                {orderType === "delivery"
                  ? "We're preparing your order and will have it on the way soon."
                  : "Your order is being prepared. We'll have it ready for pickup shortly."}
              </p>
            </div>
          </div>

          {/* Order number block */}
          <div className="border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted uppercase tracking-widest">Order Number</span>
              <span className="font-mono text-xl font-medium text-primary">{orderNumber}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">Type</span>
              <span className="capitalize">{orderType}</span>
            </div>
            {orderType === "pickup" && (
              <div className="flex items-start justify-between text-sm gap-4">
                <span className="text-foreground-muted shrink-0">Pickup at</span>
                <span className="text-right">{restaurant.address.full}</span>
              </div>
            )}
          </div>

          {/* What's next */}
          <div className="space-y-3">
            <p className="text-xs text-foreground-muted uppercase tracking-widest">What happens next</p>
            <div className="space-y-4">
              {[
                { step: "1", text: "Your order is sent to the kitchen" },
                { step: "2", text: orderType === "delivery" ? "A driver picks it up and heads your way" : "You'll get a call when it's ready" },
                { step: "3", text: orderType === "delivery" ? "Delivered hot to your door" : `Show order number ${orderNumber} at pickup` },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-4">
                  <span className="w-6 h-6 border border-border flex items-center justify-center text-xs text-foreground-muted shrink-0 mt-0.5">{step}</span>
                  <p className="text-sm text-foreground-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-primary hover:bg-primary-hover text-background py-4 font-medium transition-colors text-center"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
