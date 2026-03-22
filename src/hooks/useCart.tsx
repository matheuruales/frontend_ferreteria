"use client";

/**
 * CartContext + CartProvider + useCart hook — T016 (shell), T033 (full implementation)
 *
 * This file provides the cart state management infrastructure.
 * The shell provides the context shape and provider wrapper.
 * Full implementation (loadCart, addItem, updateQuantity, removeItem, clearCart)
 * is completed in T033 (US2).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiClient } from "@/lib/api-client";
import type { Cart } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { isAuthenticated } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  error: string | null;
  loadCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<{ error: string | null }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<{ error: string | null }>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const itemCount = cart?.item_count ?? 0;

  const loadCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setCart(null);
      return;
    }
    setLoading(true);
    const result = await apiClient.cart.getCart();
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      setCart(result.data);
      setError(null);
    }
  }, []);

  // Load cart when user logs in; reset when user logs out
  useEffect(() => {
    if (isAuthenticated()) {
      void loadCart();
    } else {
      setCart(null);
    }
  }, [user, loadCart]);

  const addItem = useCallback(
    async (productId: string, quantity: number): Promise<{ error: string | null }> => {
      const result = await apiClient.cart.addItem({ product_id: productId, quantity });
      if (result.error) {
        return { error: result.error.message };
      }
      // Reload full cart to get updated state
      await loadCart();
      return { error: null };
    },
    [loadCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<{ error: string | null }> => {
      const result = await apiClient.cart.updateItem(itemId, { quantity });
      if (result.error) {
        return { error: result.error.message };
      }
      await loadCart();
      return { error: null };
    },
    [loadCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      await apiClient.cart.removeItem(itemId);
      await loadCart();
    },
    [loadCart]
  );

  const clearCart = useCallback(async () => {
    await apiClient.cart.clearCart();
    setCart(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        error,
        loadCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        openDrawer,
        setOpenDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
