"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { restaurant, locations } from "@/config/restaurant";

type OrderType = "delivery" | "pickup";
type PaymentMethod = "card" | "cash";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DeliveryAddress {
  street: string;
  apartment: string;
  city: string;
  zipCode: string;
  instructions: string;
}

interface CheckoutProps {
  onClose: () => void;
  onOrderComplete: (orderNumber: string) => void;
}

type AuthMode = "guest" | "login";
type CheckoutStep = "auth" | "details" | "payment";

export default function Checkout({ onClose, onOrderComplete }: CheckoutProps) {
  const { items, totalPrice, clearCart } = useCart();
  const pickedLocation = locations[0];

  const [step, setStep] = useState<CheckoutStep>("auth");
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [address, setAddress] = useState<DeliveryAddress>({
    street: "",
    apartment: "",
    city: "",
    zipCode: "",
    instructions: "",
  });

  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<{ min_order_delivery: number; min_order_pickup: number } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => null);
  }, []);

  const deliveryFee = orderType === "delivery" ? 4.99 : 0;
  const tax = Math.round(totalPrice * 0.0875 * 100) / 100;
  const total = totalPrice + deliveryFee + tax;

  // Pre-fill from session if logged in (skip auth step only, not location)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single<{ full_name: string | null; phone: string | null }>();

      const parts = (profile?.full_name ?? "").split(" ");
      setCustomer({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") ?? "",
        email: user.email ?? "",
        phone: profile?.phone ?? "",
      });
      setStep("details");
    });
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setIsGoogleLoading(false);
  };

  const handleGuestContinue = () => {
    setStep("details");
  };

  const validateDetails = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customer.firstName.trim()) newErrors.firstName = "Required";
    if (!customer.lastName.trim()) newErrors.lastName = "Required";
    if (!customer.email.trim()) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(customer.email)) newErrors.email = "Invalid email";
    if (!customer.phone.trim()) newErrors.phone = "Required";

    if (orderType === "delivery") {
      if (!address.street.trim()) newErrors.street = "Required";
      if (!address.city.trim()) newErrors.city = "Required";
      if (!address.zipCode.trim()) newErrors.zipCode = "Required";
    }

    // Minimum order validation
    if (settings) {
      const min = orderType === "delivery" ? settings.min_order_delivery : settings.min_order_pickup;
      if (min > 0 && totalPrice < min) {
        newErrors.minOrder = `Minimum order for ${orderType} is $${min.toFixed(2)}. Add $${(min - totalPrice).toFixed(2)} more.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === "card") {
      if (!cardInfo.number.trim() || cardInfo.number.replace(/\s/g, "").length < 16)
        newErrors.cardNumber = "Valid card number required";
      if (!cardInfo.expiry.trim() || !/^\d{2}\/\d{2}$/.test(cardInfo.expiry))
        newErrors.expiry = "MM/YY";
      if (!cardInfo.cvc.trim() || cardInfo.cvc.length < 3)
        newErrors.cvc = "Invalid";
      if (!cardInfo.name.trim()) newErrors.cardName = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    // Mock order completion
    await new Promise((r) => setTimeout(r, 1600));
    const mockNumber = `AP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    clearCart();
    setIsProcessing(false);
    onOrderComplete(mockNumber);
    return;

    // eslint-disable-next-line no-unreachable
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: orderType,
          customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
          customer_email: customer.email,
          customer_phone: customer.phone,
          delivery_address: orderType === "delivery" ? {
            street: address.street,
            unit: address.apartment || undefined,
            city: address.city,
            state: "",
            zip: address.zipCode,
            instructions: address.instructions || undefined,
          } : null,
          items: items.map((item) => ({
            menu_item_id: item.id,
            item_name: item.name,
            item_description: item.description,
            base_price: item.price,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.unit_price * item.quantity,
            special_instructions: item.special_instructions || undefined,
            modifiers: item.modifiers.length > 0 ? item.modifiers : undefined,
          })),
          subtotal: totalPrice,
          delivery_fee: deliveryFee,
          tax,
          total,
          payment_method: paymentMethod === "card" ? "stripe" : "cash",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || "Failed to place order" });
        setIsProcessing(false);
        return;
      }

      clearCart();
      setIsProcessing(false);
      onOrderComplete(data.order_number);
    } catch {
      setErrors({ submit: "Network error. Please try again." });
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-primary flex items-center justify-center">
              <span className="text-primary text-sm font-serif">AP</span>
            </div>
            <span className="font-serif hidden sm:block">{restaurant.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {(["auth", "details", "payment"] as CheckoutStep[]).map((s, i) => {
                const labels = ["Account", "Details", "Payment"];
                const stepIndex = ["auth", "details", "payment"].indexOf(step);
                const isActive = s === step;
                const isDone = i < stepIndex;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-xs transition-colors ${isActive ? "text-foreground" : isDone ? "text-primary" : "text-foreground-muted/40"}`}>
                      <span className={`w-5 h-5 flex items-center justify-center border text-xs transition-colors ${isActive ? "border-foreground text-foreground" : isDone ? "border-primary bg-primary text-background" : "border-foreground-muted/20"}`}>
                        {isDone ? "✓" : i + 1}
                      </span>
                      <span className="hidden sm:inline">{labels[i]}</span>
                    </div>
                    {i < 2 && <div className={`h-px w-6 transition-colors ${isDone ? "bg-primary" : "bg-border"}`} />}
                  </div>
                );
              })}
            </div>

            {/* Auth Step */}
            {step === "auth" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-serif mb-2">Checkout</h1>
                  <p className="text-foreground-muted">Sign in for a faster checkout or continue as guest</p>
                </div>

                {/* Google Login */}
                <div className="border border-border p-6 space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-3 border border-border hover:border-foreground-muted py-4 transition-colors disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium">Continue with Google</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-foreground-muted">
                    Quick checkout with your saved information
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-sm text-foreground-muted">or</span>
                  </div>
                </div>

                {/* Guest Checkout */}
                <div className="border border-border p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border border-border flex items-center justify-center">
                      <svg className="h-6 w-6 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Guest Checkout</h3>
                      <p className="text-sm text-foreground-muted">No account needed</p>
                    </div>
                  </div>
                  <button
                    onClick={handleGuestContinue}
                    className="w-full bg-primary hover:bg-primary-hover text-background py-4 font-medium transition-colors"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            )}

            {/* Details Step */}
            {step === "details" && (
              <div className="space-y-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-serif mb-2">Delivery Details</h1>
                    <p className="text-foreground-muted">Where should we send your order?</p>
                  </div>
                  {/* Dev test data buttons */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="flex gap-2 flex-shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomer({ firstName: "Marcus", lastName: "Rivera", email: "marcus.rivera@gmail.com", phone: "614-308-4471" });
                          setOrderType("delivery");
                          setAddress({ street: "123 Main St", apartment: "Apt 4B", city: "San Francisco", zipCode: "94103", instructions: "Leave at door" });
                        }}
                        className="text-xs px-3 py-1.5 border border-dashed border-primary/50 text-primary/70 hover:border-primary hover:text-primary transition-colors"
                      >
                        Fill Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomer({ firstName: "Marcus", lastName: "Rivera", email: "marcus.rivera@gmail.com", phone: "614-308-4471" });
                          setOrderType("pickup");
                          setAddress({ street: "", apartment: "", city: "", zipCode: "", instructions: "" });
                        }}
                        className="text-xs px-3 py-1.5 border border-dashed border-primary/50 text-primary/70 hover:border-primary hover:text-primary transition-colors"
                      >
                        Fill Pickup
                      </button>
                    </div>
                  )}
                </div>

                {/* Order Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setOrderType("delivery")}
                    className={`p-6 border text-left transition-all ${
                      orderType === "delivery"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground-muted"
                    }`}
                  >
                    <svg className="h-6 w-6 mb-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="font-medium text-lg">Delivery</div>
                    <div className="text-sm text-foreground-muted">30-45 min • $4.99</div>
                  </button>
                  <button
                    onClick={() => setOrderType("pickup")}
                    className={`p-6 border text-left transition-all ${
                      orderType === "pickup"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground-muted"
                    }`}
                  >
                    <svg className="h-6 w-6 mb-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="font-medium text-lg">Pickup</div>
                    <div className="text-sm text-foreground-muted">15-20 min • Free</div>
                  </button>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h2 className="text-lg font-serif">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="First name"
                        value={customer.firstName}
                        onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                        className={`w-full px-4 py-4 bg-background border ${errors.firstName ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none`}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Last name"
                        value={customer.lastName}
                        onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                        className={`w-full px-4 py-4 bg-background border ${errors.lastName ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none`}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className={`w-full px-4 py-4 bg-background border ${errors.email ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className={`w-full px-4 py-4 bg-background border ${errors.phone ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Delivery Address */}
                {orderType === "delivery" && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-serif">Delivery Address</h2>
                    <div>
                      <input
                        type="text"
                        placeholder="Street address"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className={`w-full px-4 py-4 bg-background border ${errors.street ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none`}
                      />
                      {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                    </div>
                    <input
                      type="text"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={address.apartment}
                      onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                      className="w-full px-4 py-4 bg-background border border-border focus:border-primary focus:outline-none"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className={`w-full px-4 py-4 bg-background border ${errors.city ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none`}
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="ZIP code"
                          value={address.zipCode}
                          onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                          className={`w-full px-4 py-4 bg-background border ${errors.zipCode ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none`}
                        />
                        {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>
                    <textarea
                      placeholder="Delivery instructions (optional)"
                      value={address.instructions}
                      onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-4 bg-background border border-border focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                )}

                {/* Pickup Location */}
                {orderType === "pickup" && (
                  <div className="p-5 border border-border bg-card">
                    <div className="flex items-start gap-4">
                      <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">{pickedLocation.name}</p>
                        <p className="text-sm text-foreground-muted mt-0.5">{pickedLocation.address}</p>
                        <p className="text-xs text-foreground-muted/60 mt-0.5">{pickedLocation.hours}</p>
                      </div>
                    </div>
                  </div>
                )}

                {errors.minOrder && (
                  <div className="p-4 border border-amber-500/30 bg-amber-500/5 text-amber-400 text-sm">
                    {errors.minOrder}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (validateDetails()) setStep("payment");
                  }}
                  className="w-full bg-primary hover:bg-primary-hover text-background py-4 font-medium transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <div className="space-y-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-serif mb-2">Payment</h1>
                    <p className="text-foreground-muted">Choose your payment method</p>
                  </div>
                  {process.env.NODE_ENV === "development" && (
                    <div className="flex gap-2 flex-shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("card");
                          setCardInfo({ number: "4242 4242 4242 4242", expiry: "12/28", cvc: "123", name: "Marcus Rivera" });
                        }}
                        className="text-xs px-3 py-1.5 border border-dashed border-primary/50 text-primary/70 hover:border-primary hover:text-primary transition-colors"
                      >
                        Fill Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cash")}
                        className="text-xs px-3 py-1.5 border border-dashed border-primary/50 text-primary/70 hover:border-primary hover:text-primary transition-colors"
                      >
                        Use Cash
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-6 border text-left transition-all ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground-muted"
                    }`}
                  >
                    <svg className="h-6 w-6 mb-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div className="font-medium text-lg">Credit Card</div>
                    <div className="text-sm text-foreground-muted">Visa, Mastercard, Amex</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-6 border text-left transition-all ${
                      paymentMethod === "cash"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground-muted"
                    }`}
                  >
                    <svg className="h-6 w-6 mb-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="font-medium text-lg">Cash</div>
                    <div className="text-sm text-foreground-muted">Pay on {orderType}</div>
                  </button>
                </div>

                {/* Card Form */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-serif">Card Details</h2>
                    <div>
                      <input
                        type="text"
                        placeholder="Card number"
                        value={cardInfo.number}
                        onChange={(e) => setCardInfo({ ...cardInfo, number: formatCardNumber(e.target.value) })}
                        maxLength={19}
                        className={`w-full px-4 py-4 bg-background border ${errors.cardNumber ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none font-mono`}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardInfo.expiry}
                          onChange={(e) => setCardInfo({ ...cardInfo, expiry: formatExpiry(e.target.value) })}
                          maxLength={5}
                          className={`w-full px-4 py-4 bg-background border ${errors.expiry ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none font-mono`}
                        />
                        {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="CVC"
                          value={cardInfo.cvc}
                          onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value.replace(/\D/g, "") })}
                          maxLength={4}
                          className={`w-full px-4 py-4 bg-background border ${errors.cvc ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none font-mono`}
                        />
                        {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Name on card"
                        value={cardInfo.name}
                        onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                        className={`w-full px-4 py-4 bg-background border ${errors.cardName ? "border-red-500" : "border-border"} focus:border-primary focus:outline-none`}
                      />
                      {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                    </div>
                  </div>
                )}

                {/* Cash Info */}
                {paymentMethod === "cash" && (
                  <div className="p-6 border border-border bg-card">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Cash Payment</p>
                        <p className="text-foreground-muted mt-1">
                          {orderType === "delivery"
                            ? "Please have exact change ready. Our driver will collect payment upon delivery."
                            : "Pay at the counter when you pick up your order."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {errors.submit && (
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("details")}
                    className="flex-1 py-4 border border-border hover:border-foreground-muted transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-[2] bg-primary hover:bg-primary-hover text-background py-4 font-medium transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Place Order • $${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 border border-border bg-card p-6 space-y-6">
              <h2 className="text-lg font-serif">Order Summary</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.cartKey} className="text-sm">
                    <div className="flex justify-between">
                      <span>
                        <span className="text-foreground-muted">{item.quantity}x</span>
                        <span className="ml-2">{item.name}</span>
                      </span>
                      <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-foreground-muted mt-0.5 ml-6">
                        {item.modifiers.map((m) => m.option_name).join(", ")}
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

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">
                    {orderType === "delivery" ? "Delivery" : "Pickup"}
                  </span>
                  <span>{orderType === "delivery" ? `$${deliveryFee.toFixed(2)}` : "Free"}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-xl font-serif">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {(
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  {step !== "auth" && customer.email && (
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Contact</span>
                      <span className="truncate ml-4 text-right">{customer.email}</span>
                    </div>
                  )}
                  {step !== "auth" && orderType === "delivery" && address.street && (
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Deliver to</span>
                      <span className="text-right ml-4">{address.street}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
