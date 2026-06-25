/**
 * Razorpay Checkout JS loader + typed opener.
 *
 * The script is loaded once on first call (cached). The opener wraps the
 * `Razorpay` constructor with a typed options object and a Promise that
 * resolves with the callback fields from the success handler.
 */
declare global {
  interface Window {
    Razorpay?: new (opts: RazorpayOpenOptions) => RazorpayInstance;
  }
}

export interface RazorpayOpenOptions {
  key: string;
  /** Either `order_id` (one-time) or `subscription_id` (recurring) — never both. */
  order_id?: string;
  subscription_id?: string;
  amount?: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpaySuccessResponse {
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, cb: (err: unknown) => void) => void;
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let loaderPromise: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("loadRazorpay called server-side"));
  if (window.Razorpay) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Razorpay script failed to load")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loaderPromise = null;
      reject(new Error("Razorpay script failed to load — check your connection"));
    };
    document.head.appendChild(s);
  });

  return loaderPromise;
}

/**
 * Open the Razorpay modal and resolve when the user completes payment.
 *
 * Rejects if the user closes the modal without paying (so callers can show a
 * "you cancelled" message). Resolves with the four signature fields needed by
 * the verify endpoints.
 */
export async function openCheckout(
  opts: Omit<RazorpayOpenOptions, "handler" | "modal">,
): Promise<RazorpaySuccessResponse> {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error("Razorpay not available after load");

  return new Promise<RazorpaySuccessResponse>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      ...opts,
      handler: (response) => resolve(response),
      modal:   { ondismiss: () => reject(new Error("Payment cancelled")) },
    });
    rzp.on("payment.failed", (err) => reject(new Error(_failureMessage(err))));
    rzp.open();
  });
}

function _failureMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "error" in err) {
    const inner = (err as { error: { description?: string } }).error;
    if (inner.description) return inner.description;
  }
  return "Payment failed";
}
