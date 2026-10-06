import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';

const client =
  env.razorpay.enabled && env.razorpay.keyId && env.razorpay.keySecret
    ? new Razorpay({
        key_id: env.razorpay.keyId,
        key_secret: env.razorpay.keySecret,
      })
    : null;

export function isRazorpayConfigured() {
  return Boolean(env.razorpay.enabled && client);
}

export async function createRazorpayOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  if (!client) throw new Error('Razorpay is not configured.');
  return client.orders.create({ amount, currency, receipt, notes });
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!env.razorpay.keySecret || !orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!signature || !env.razorpay.webhookSecret || !rawBody) return false;
  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
