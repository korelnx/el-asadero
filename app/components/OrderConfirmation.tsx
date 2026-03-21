"use client";

import Link from "next/link";

interface OrderConfirmationProps {
  orderNumber: string;
  onClose: () => void;
}

export default function OrderConfirmation({ orderNumber, onClose }: OrderConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-card border border-border">
        {/* Success header */}
        <div className="p-8 text-center border-b border-border">
          <div className="w-14 h-14 mx-auto mb-4 border-2 border-primary flex items-center justify-center">
            <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif mb-1">Order Placed!</h2>
          <p className="text-foreground-muted text-sm">We're getting started on your order</p>
        </div>

        {/* Order number */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-background border border-border">
            <span className="text-sm text-foreground-muted">Order Number</span>
            <span className="font-mono font-medium text-primary">{orderNumber}</span>
          </div>

          <p className="text-sm text-foreground-muted text-center">
            Show this number when picking up, or track your order status below.
          </p>
        </div>

        <div className="p-6 pt-0 space-y-3">
          <Link
            href={`/track?order_number=${orderNumber}`}
            onClick={onClose}
            className="block w-full py-3 border border-border hover:border-primary text-center text-sm transition-colors"
          >
            Track Order Status
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-background font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
