"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import Checkout from "./Checkout";
import OrderConfirmation from "./OrderConfirmation";

export default function Cart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const handleProceedToCheckout = () => {
    setIsOpen(false);
    setShowCheckout(true);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
    setIsOpen(true);
  };

  const handleOrderComplete = (num: string) => {
    setOrderNumber(num);
    setShowCheckout(false);
    setShowConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setOrderNumber(null);
  };

  if (showCheckout) {
    return <Checkout onClose={handleCheckoutClose} onOrderComplete={handleOrderComplete} />;
  }

  if (showConfirmation) {
    return <OrderConfirmation orderNumber={orderNumber!} onClose={handleConfirmationClose} />;
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-card border-l border-border z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-serif">Your Order</h2>
            {items.length > 0 && (
              <p className="text-sm text-foreground-muted">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            )}
          </div>
          <button onClick={() => setIsOpen(false)} className="text-foreground-muted hover:text-foreground transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border border-border mx-auto mb-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-foreground-muted mb-2">Your cart is empty</p>
              <p className="text-sm text-foreground-muted/70">Explore our menu to add items</p>
              <button onClick={() => setIsOpen(false)} className="mt-6 px-6 py-2 border border-border hover:border-primary text-sm transition-colors">
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-border p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif truncate">{item.name}</h3>
                      <p className="text-sm text-foreground-muted">${item.price.toFixed(2)} each</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-foreground-muted hover:text-primary transition-colors ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 border border-border hover:border-primary text-foreground-muted hover:text-foreground flex items-center justify-center transition-colors">-</button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border border-border hover:border-primary text-foreground-muted hover:text-foreground flex items-center justify-center transition-colors">+</button>
                    </div>
                    <span className="font-medium text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted">
                <span>Delivery fee</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-border">
              <span className="font-serif text-lg">Subtotal</span>
              <span className="text-primary font-medium text-lg">${totalPrice.toFixed(2)}</span>
            </div>
            <button onClick={handleProceedToCheckout} className="w-full bg-primary hover:bg-primary-hover text-background py-4 font-medium transition-colors">
              Proceed to Checkout
            </button>
            <button onClick={clearCart} className="w-full text-foreground-muted hover:text-foreground py-2 transition-colors text-sm">
              Clear Order
            </button>
          </div>
        )}
      </div>
    </>
  );
}
