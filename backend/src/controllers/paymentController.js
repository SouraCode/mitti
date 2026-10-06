import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import ApiError from '../utils/ApiError.js';
import { effectivePrice } from '../utils/pricing.js';
import { env } from '../config/env.js';
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from '../services/razorpayService.js';

function estimateDeliveryDate(from = new Date()) {
  const estimate = new Date(from);
  let businessDaysAdded = 0;
  while (businessDaysAdded < env.deliveryEstimateBusinessDays) {
    estimate.setUTCDate(estimate.getUTCDate() + 1);
    const day = estimate.getUTCDay();
    if (day !== 0 && day !== 6) businessDaysAdded += 1;
  }
  estimate.setUTCHours(12, 0, 0, 0);
  return estimate;
}

function normalizeDeliveryAddress(deliveryAddress) {
  return Object.fromEntries(
    Object.entries(deliveryAddress).map(([key, value]) => [key, String(value || '').trim()])
  );
}

async function buildOrderItems(items) {
  const normalized = [];
  let subtotal = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!item.productId || !Number.isInteger(quantity) || quantity < 1)
      throw new ApiError(400, 'Invalid cart item.');

    const product = await Product.findOne({ _id: item.productId, status: 'published' });
    if (!product) throw new ApiError(409, 'A product in your cart is no longer available.');

    const offers = await Offer.find({ product: product._id, enabled: true });
    const price = effectivePrice(product, offers).price;

    if (product.stockQuantity < quantity) {
      throw new ApiError(409, `${product.name} does not have enough stock.`);
    }

    normalized.push({
      product: product._id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images.find((image) => image.isPrimary)?.url || product.images[0]?.url,
      unitPrice: price,
      quantity,
    });
    subtotal += price * quantity;
  }

  return { normalized, subtotal };
}

async function decrementInventoryForOrder(order, session) {
  for (const item of order.items) {
    const product = await Product.findOneAndUpdate(
      { _id: item.product, status: 'published', stockQuantity: { $gte: item.quantity } },
      { $inc: { stockQuantity: -item.quantity } },
      { new: true, session }
    );

    if (!product) {
      throw new ApiError(409, `${item.name} does not have enough stock.`);
    }
  }
}

export async function paymentOptions(req, res) {
  const onlineEnabled = Boolean(env.razorpay.enabled && env.razorpay.keyId);
  res.json({
    methods: [
      { id: 'cod', label: 'Cash on delivery', enabled: env.codEnabled },
      { id: 'razorpay', label: 'Online payment', enabled: onlineEnabled },
    ],
    onlinePayments: onlineEnabled,
    razorpay: { keyId: env.razorpay.keyId || null },
  });
}

export async function createRazorpayPaymentOrder(req, res) {
  if (!isRazorpayConfigured()) {
    throw new ApiError(503, 'Razorpay is not configured for this store yet.');
  }

  const { items, deliveryAddress } = req.validated.body;
  if (!Array.isArray(items) || !items.length) throw new ApiError(400, 'Your cart is empty.');
  if (
    !deliveryAddress ||
    !['name', 'phone', 'line1', 'city', 'state', 'postalCode', 'country'].every((key) =>
      String(deliveryAddress[key] || '').trim()
    )
  )
    throw new ApiError(400, 'Complete all required delivery address fields.');
  if (!/^\+?[0-9\s()-]{8,20}$/.test(deliveryAddress.phone))
    throw new ApiError(400, 'Enter a valid phone number.');

  const { normalized, subtotal } = await buildOrderItems(items);
  const order = await Order.create({
    customer: req.user._id,
    items: normalized,
    deliveryAddress: normalizeDeliveryAddress(deliveryAddress),
    subtotal,
    total: subtotal,
    paymentMethod: 'razorpay',
    paymentState: 'pending',
    fulfillmentStatus: 'pending',
    estimatedDeliveryAt: estimateDeliveryDate(),
  });

  const amountInPaise = Math.round((Number(subtotal) + Number.EPSILON) * 100);
  const razorpayOrder = await createRazorpayOrder({
    amount: amountInPaise,
    currency: 'INR',
    receipt: String(order._id),
    notes: {
      customerId: String(req.user._id),
      orderId: String(order._id),
    },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json({
    keyId: env.razorpay.keyId,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    localOrderId: order._id,
  });
}

export async function verifyRazorpayPayment(req, res) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.validated.body;

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!order) throw new ApiError(404, 'Payment order not found.');
  if (!order.customer.equals(req.user._id)) {
    throw new ApiError(403, 'You do not have permission to verify this payment.');
  }

  if (order.paymentState === 'paid' && order.razorpayPaymentId === razorpay_payment_id) {
    return res.json({ order });
  }

  if (!verifyPaymentSignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature })) {
    throw new ApiError(400, 'Invalid Razorpay signature.');
  }

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    const existingOrder = await Order.findOne({ _id: order._id, customer: req.user._id }).session(session);
    if (!existingOrder) throw new ApiError(404, 'Payment order not found.');
    if (existingOrder.paymentState === 'paid' && existingOrder.razorpayPaymentId === razorpay_payment_id) {
      return;
    }

    for (const item of existingOrder.items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, status: 'published', stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity } },
        { new: true, session }
      );
      if (!product) {
        throw new ApiError(409, `${item.name} does not have enough stock.`);
      }
    }

    existingOrder.paymentState = 'paid';
    existingOrder.paymentMethod = 'razorpay';
    existingOrder.razorpayPaymentId = razorpay_payment_id;
    existingOrder.razorpaySignature = razorpay_signature;
    existingOrder.paidAt = new Date();
    existingOrder.fulfillmentStatus = 'processing';
    await existingOrder.save({ session });
  });

  const updatedOrder = await Order.findById(order._id);
  res.json({ order: updatedOrder });
}

export async function handleRazorpayWebhook(req, res) {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '', 'utf8');
  const signature = req.headers['x-razorpay-signature'];

  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new ApiError(400, 'Invalid Razorpay webhook signature.');
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    throw new ApiError(400, 'Malformed Razorpay webhook payload.');
  }

  const event = payload.event;
  const paymentEntity = payload?.payload?.payment?.entity || {};
  const orderEntity = payload?.payload?.order?.entity || {};
  const currentPaymentId = paymentEntity.id;
  const currentOrderId = orderEntity.id || paymentEntity.order_id;
  const localOrderId = orderEntity.receipt || paymentEntity.notes?.orderId;

  let order = null;
  if (currentOrderId) {
    order = await Order.findOne({ razorpayOrderId: currentOrderId });
  }
  if (!order && localOrderId && mongoose.isValidObjectId(localOrderId)) {
    order = await Order.findById(localOrderId);
  }

  if (!order) {
    return res.json({ received: true });
  }

  if (event === 'payment.failed') {
    if (order.paymentState !== 'failed') {
      order.paymentState = 'failed';
      order.fulfillmentStatus = 'pending';
      await order.save();
    }
    return res.json({ received: true });
  }

  if (event === 'refund.processed') {
    order.paymentState = 'refunded';
    order.fulfillmentStatus = 'cancelled';
    await order.save();
    return res.json({ received: true });
  }

  if (event === 'payment.captured' || event === 'order.paid') {
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const currentOrder = await Order.findOne({ _id: order._id }).session(session);
      if (!currentOrder) return;
      if (currentOrder.paymentState === 'paid' && currentOrder.razorpayPaymentId === currentPaymentId) {
        return;
      }

      for (const item of currentOrder.items) {
        const product = await Product.findOneAndUpdate(
          { _id: item.product, status: 'published', stockQuantity: { $gte: item.quantity } },
          { $inc: { stockQuantity: -item.quantity } },
          { new: true, session }
        );
        if (!product) {
          throw new ApiError(409, `${item.name} does not have enough stock.`);
        }
      }

      currentOrder.paymentState = 'paid';
      currentOrder.paymentMethod = 'razorpay';
      currentOrder.razorpayPaymentId ||= currentPaymentId;
      currentOrder.razorpaySignature ||= paymentEntity?.signature || '';
      currentOrder.paidAt ||= new Date();
      currentOrder.fulfillmentStatus = 'processing';
      await currentOrder.save({ session });
    });
    return res.json({ received: true });
  }

  res.json({ received: true });
}
