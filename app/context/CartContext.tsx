"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SelectedModifier {
  modifier_group_id: string;
  group_name: string;
  modifier_option_id: string;
  option_name: string;
  price_delta: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  image_url: string | null;
  is_featured: boolean;
  tags: string[];
}

export interface CartItem extends MenuItem {
  cartKey: string;
  quantity: number;
  unit_price: number;
  modifiers: SelectedModifier[];
  special_instructions: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, modifiers?: SelectedModifier[], special_instructions?: string) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  updateSpecialInstructions: (cartKey: string, instructions: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "el_asadero_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, hydrated]);

  const addItem = (item: MenuItem, modifiers: SelectedModifier[] = [], special_instructions = "") => {
    const hasCustomizations = modifiers.length > 0 || special_instructions.trim().length > 0;
    const modifierTotal = modifiers.reduce((sum, m) => sum + m.price_delta, 0);
    const unit_price = item.price + modifierTotal;

    setItems((prev) => {
      if (!hasCustomizations) {
        const existing = prev.find((i) => i.cartKey === item.id);
        if (existing) {
          return prev.map((i) =>
            i.cartKey === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          { ...item, cartKey: item.id, quantity: 1, unit_price, modifiers: [], special_instructions: "" },
        ];
      }
      return [
        ...prev,
        {
          ...item,
          cartKey: `${item.id}-${Date.now()}`,
          quantity: 1,
          unit_price,
          modifiers,
          special_instructions,
        },
      ];
    });
  };

  const removeItem = (cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartKey);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
    );
  };

  const updateSpecialInstructions = (cartKey: string, instructions: string) => {
    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, special_instructions: instructions } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateSpecialInstructions,
        clearCart,
        isOpen,
        setIsOpen,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
