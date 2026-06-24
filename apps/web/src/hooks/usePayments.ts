"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type {
  CreateOrderResponse,
  CreateSubscriptionResponse,
  PaymentRow,
  PlanCatalogItem,
  PlanKey,
  SubscriptionView,
  VerifyPaymentResponse,
} from "@axiom/shared-types";
import { api } from "@/lib/api";
import { openCheckout } from "@/lib/razorpay";
import { useAuth } from "@/hooks/useAuth";
import { setCredentials } from "@/store/authSlice";

interface PricingResponse {
  plans: PlanCatalogItem[];
}

interface SubscriptionResponse {
  subscription: SubscriptionView;
}

interface HistoryResponse {
  payments: PaymentRow[];
}

export function usePayments() {
  const dispatch = useDispatch();
  const { user, accessToken } = useAuth();

  const [plans, setPlans]                 = useState<PlanCatalogItem[]>([]);
  const [subscription, setSubscription]   = useState<SubscriptionView | null>(null);
  const [history, setHistory]             = useState<PaymentRow[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // Bootstrap — load plans always, subscription + history only when logged in.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const pricing = await api.get<PricingResponse>("/payments/pricing");
        if (cancelled) return;
        setPlans(pricing.data.plans);

        if (user) {
          const [sub, hist] = await Promise.all([
            api.get<SubscriptionResponse>("/payments/subscription"),
            api.get<HistoryResponse>("/payments/history"),
          ]);
          if (cancelled) return;
          setSubscription(sub.data.subscription);
          setHistory(hist.data.payments);
        }
      } catch {
        if (!cancelled) setError("Failed to load pricing.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // ── Subscribe (recurring) ───────────────────────────────────────────────────
  // Recommended path — Razorpay charges monthly/quarterly/annually after first capture.
  const subscribe = useCallback(async (plan: PlanKey) => {
    if (!user) throw new Error("Sign in to subscribe");
    setError(null);
    setIsCheckingOut(true);
    try {
      const { data: setup } = await api.post<CreateSubscriptionResponse>(
        "/payments/create-subscription",
        { plan },
      );

      const checkoutResponse = await openCheckout({
        key:             setup.keyId,
        subscription_id: setup.subscriptionId,
        currency:        "INR",
        name:            "AXIOM Premium",
        description:     `${plan.charAt(0) + plan.slice(1).toLowerCase()} plan`,
        prefill:         { name: user.name, email: user.email },
        theme:           { color: "#A855F7" },
      });

      const { data: verified } = await api.post<VerifyPaymentResponse>(
        "/payments/verify-subscription",
        {
          razorpay_subscription_id: checkoutResponse.razorpay_subscription_id,
          razorpay_payment_id:      checkoutResponse.razorpay_payment_id,
          razorpay_signature:       checkoutResponse.razorpay_signature,
        },
      );

      setSubscription(verified.subscription);
      // Bump the cached user role optimistically — backend has flipped it server-side
      if (user) {
        dispatch(setCredentials({ user: { ...user, role: "PREMIUM" }, accessToken: accessToken ?? "" }));
      }
      return verified;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Subscription failed";
      setError(msg);
      throw err;
    } finally {
      setIsCheckingOut(false);
    }
  }, [user, dispatch, accessToken]);

  // ── One-time order (kept as fallback / single-cycle purchase) ──────────────
  const purchase = useCallback(async (plan: PlanKey) => {
    if (!user) throw new Error("Sign in to purchase");
    setError(null);
    setIsCheckingOut(true);
    try {
      const { data: order } = await api.post<CreateOrderResponse>("/payments/create-order", { plan });

      const checkoutResponse = await openCheckout({
        key:         order.keyId,
        order_id:    order.orderId,
        amount:      order.amount,
        currency:    order.currency,
        name:        "AXIOM Premium",
        description: `${plan.charAt(0) + plan.slice(1).toLowerCase()} plan`,
        prefill:     { name: user.name, email: user.email },
        theme:       { color: "#A855F7" },
      });

      const { data: verified } = await api.post<VerifyPaymentResponse>("/payments/verify", {
        razorpay_order_id:   checkoutResponse.razorpay_order_id,
        razorpay_payment_id: checkoutResponse.razorpay_payment_id,
        razorpay_signature:  checkoutResponse.razorpay_signature,
      });

      setSubscription(verified.subscription);
      if (user) {
        dispatch(setCredentials({ user: { ...user, role: "PREMIUM" }, accessToken: accessToken ?? "" }));
      }
      return verified;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setError(msg);
      throw err;
    } finally {
      setIsCheckingOut(false);
    }
  }, [user, dispatch, accessToken]);

  const cancel = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.post<SubscriptionResponse>("/payments/cancel");
      setSubscription(data.subscription);
      return data.subscription;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cancellation failed";
      setError(msg);
      throw err;
    }
  }, []);

  return {
    plans,
    subscription,
    history,
    isLoading,
    isCheckingOut,
    error,
    subscribe,
    purchase,
    cancel,
    isPremium: user?.role === "PREMIUM" || user?.role === "ADMIN",
  };
}
