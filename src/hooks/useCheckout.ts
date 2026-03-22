"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { CheckoutSummary, ShippingAddress } from "@/types";

interface CheckoutState {
  shippingAddress: ShippingAddress | null;
  summary: CheckoutSummary | null;
  checkoutUrl: string | null;
  paymentReference: string | null;
  loading: boolean;
  error: string | null;
}

interface CheckoutActions {
  submitShipping: (address: ShippingAddress) => Promise<{ error: string | null }>;
  initiatePayment: () => Promise<{ error: string | null }>;
  reset: () => void;
}

export function useCheckout(): CheckoutState & CheckoutActions {
  const [state, setState] = useState<CheckoutState>({
    shippingAddress: null,
    summary: null,
    checkoutUrl: null,
    paymentReference: null,
    loading: false,
    error: null,
  });

  const submitShipping = async (
    address: ShippingAddress
  ): Promise<{ error: string | null }> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await apiClient.checkout.validateCheckout({
      shipping_address: address,
    });
    setState((s) => ({ ...s, loading: false }));

    if (result.error) {
      setState((s) => ({ ...s, error: result.error!.message }));
      return { error: result.error.message };
    }

    setState((s) => ({
      ...s,
      shippingAddress: address,
      summary: result.data,
      error: null,
    }));
    return { error: null };
  };

  const initiatePayment = async (): Promise<{ error: string | null }> => {
    if (!state.shippingAddress) {
      return { error: "Dirección de envío requerida" };
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await apiClient.checkout.createSession({
      shipping_address: state.shippingAddress,
    });
    setState((s) => ({ ...s, loading: false }));

    if (result.error) {
      setState((s) => ({ ...s, error: result.error!.message }));
      return { error: result.error.message };
    }

    setState((s) => ({
      ...s,
      checkoutUrl: result.data.checkout_url,
      paymentReference: result.data.payment_reference,
      error: null,
    }));
    return { error: null };
  };

  const reset = () => {
    setState({
      shippingAddress: null,
      summary: null,
      checkoutUrl: null,
      paymentReference: null,
      loading: false,
      error: null,
    });
  };

  return { ...state, submitShipping, initiatePayment, reset };
}
