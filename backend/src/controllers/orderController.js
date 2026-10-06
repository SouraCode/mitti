import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import { effectivePrice } from '../utils/pricing.js';
import { env } from '../config/env.js';

function estimateDeliveryDate(from = new Date()) {
  const estimate = new Date(from);
  let businessDaysAdded = 0;
  while (businessDaysAdded < env.deliveryEstimateBusinessDays) {
    estimate.setUTCDate(estimate.getUTCDate() + 1);
    const day = estimate.getUTCDay();
    if (day !== 0 && day !== 6) businessDaysAdded += 1;
  }
  // Noon UTC keeps the displayed calendar day stable for most customer time zones.
  estimate.setUTCHours(12, 0, 0, 0);
  return estimate;
}

export function paymentOptions(req, res) {
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
export async function createOrder(req, res) {
  const { items, deliveryAddress, paymentMethod } = req.body;
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
  if (paymentMethod !== 'cod' || !env.codEnabled)
    throw new ApiError(409, 'Cash on delivery is not enabled for this store.');
  const normalized = [];
  try {
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!item.productId || !Number.isInteger(quantity) || quantity < 1)
        throw new ApiError(400, 'Invalid cart item.');
      const product = await Product.findOne({ _id: item.productId, status: 'published' });
      if (!product) throw new ApiError(409, 'A product in your cart is no longer available.');
      const offers = await Offer.find({ product: product._id, enabled: true });
      const price = effectivePrice(product, offers).price;
      const reduced = await Product.findOneAndUpdate(
        { _id: product._id, stockQuantity: { $gte: quantity } },
        { $inc: { stockQuantity: -quantity } },
        { new: true }
      );
      if (!reduced) throw new ApiError(409, `${product.name} does not have enough stock.`);
      normalized.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url,
        unitPrice: price,
        quantity,
      });
    }
    const total = normalized.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const order = await Order.create({
      customer: req.user._id,
      items: normalized,
      deliveryAddress: Object.fromEntries(
        Object.entries(deliveryAddress).map(([key, value]) => [key, String(value || '').trim()])
      ),
      subtotal: total,
      total,
      paymentMethod: 'cod',
      paymentState: 'pending',
      estimatedDeliveryAt: estimateDeliveryDate(),
    });
    res.status(201).json({ order });
  } catch (error) {
    await Promise.all(
      normalized.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { stockQuantity: item.quantity } })
      )
    );
    throw error;
  }
}
export async function myOrders(req, res) {
  res.json({ orders: await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }) });
}

export async function myOrder(req, res) {
  const { orderId } = req.params;
  if (!mongoose.isValidObjectId(orderId)) throw new ApiError(404, 'Order not found.');
  const order = await Order.findOne({ _id: orderId, customer: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found.');
  res.json({ order });
}
