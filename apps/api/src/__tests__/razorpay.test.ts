/**
 * Razorpay signature verification — the security-critical bit.
 *
 * The razorpay util captures secrets at module-load time, so we set env first
 * via `vi.hoisted` and import the module inside the test suite.
 */
import { describe, it, expect, vi } from "vitest";
import crypto from "crypto";

// vi.hoisted runs before all static imports, so the razorpay module captures
// these env values at its own load time.
vi.hoisted(() => {
  process.env["RAZORPAY_KEY_ID"]         = "rzp_test_aaaa";
  process.env["RAZORPAY_KEY_SECRET"]     = "test_key_secret_aaaaaa";
  process.env["RAZORPAY_WEBHOOK_SECRET"] = "test_webhook_secret_bbbbbb";
});

import {
  verifyOrderSignature,
  verifySubscriptionSignature,
  verifyWebhookSignature,
} from "../utils/razorpay";

const KEY_SECRET     = "test_key_secret_aaaaaa";
const WEBHOOK_SECRET = "test_webhook_secret_bbbbbb";

function sign(secret: string, payload: string | Buffer): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("verifyOrderSignature", () => {
  it("accepts a genuine signature", () => {
    const sig = sign(KEY_SECRET, "order_AAA111|pay_BBB222");
    expect(verifyOrderSignature("order_AAA111", "pay_BBB222", sig)).toBe(true);
  });

  it("rejects a tampered paymentId", () => {
    const sig = sign(KEY_SECRET, "order_AAA111|pay_BBB222");
    expect(verifyOrderSignature("order_AAA111", "pay_BBB223", sig)).toBe(false);
  });

  it("rejects a forged signature", () => {
    expect(verifyOrderSignature("order_X", "pay_Y", "deadbeef".repeat(8))).toBe(false);
  });

  it("rejects a signature signed with the wrong secret", () => {
    const sig = sign("wrong_secret", "order_X|pay_Y");
    expect(verifyOrderSignature("order_X", "pay_Y", sig)).toBe(false);
  });

  it("rejects non-hex garbage without throwing", () => {
    expect(verifyOrderSignature("order_X", "pay_Y", "not-hex-at-all-lol")).toBe(false);
  });

  it("rejects empty signature", () => {
    expect(verifyOrderSignature("order_X", "pay_Y", "")).toBe(false);
  });
});

describe("verifySubscriptionSignature", () => {
  it("accepts the documented Razorpay payload format", () => {
    // Razorpay docs: HMAC(payment_id + '|' + subscription_id, secret)
    const sig = sign(KEY_SECRET, "pay_BBB222|sub_AAA111");
    expect(verifySubscriptionSignature("sub_AAA111", "pay_BBB222", sig)).toBe(true);
  });

  it("rejects when fields are swapped (proves order matters)", () => {
    const sig = sign(KEY_SECRET, "sub_AAA111|pay_BBB222"); // wrong order
    expect(verifySubscriptionSignature("sub_AAA111", "pay_BBB222", sig)).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  it("accepts a signature derived from the raw bytes", () => {
    const body = Buffer.from('{"event":"payment.captured","payload":{"a":1}}', "utf8");
    const sig  = sign(WEBHOOK_SECRET, body);
    expect(verifyWebhookSignature(body, sig)).toBe(true);
  });

  it("rejects when even one byte of the body changes", () => {
    const body = Buffer.from('{"event":"payment.captured"}', "utf8");
    const sig  = sign(WEBHOOK_SECRET, body);
    const tampered = Buffer.from('{"event":"payment.failed"}', "utf8");
    expect(verifyWebhookSignature(tampered, sig)).toBe(false);
  });

  it("accepts string body and Buffer body equivalently", () => {
    const raw  = '{"hello":"world"}';
    const sig  = sign(WEBHOOK_SECRET, Buffer.from(raw, "utf8"));
    expect(verifyWebhookSignature(raw, sig)).toBe(true);
    expect(verifyWebhookSignature(Buffer.from(raw, "utf8"), sig)).toBe(true);
  });

  it("rejects signature signed with the order/payment secret instead of webhook secret", () => {
    const body = Buffer.from('{"event":"x"}', "utf8");
    const sig  = sign(KEY_SECRET, body); // wrong secret
    expect(verifyWebhookSignature(body, sig)).toBe(false);
  });
});
