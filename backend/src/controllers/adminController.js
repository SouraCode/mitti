import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import InventoryHistory from '../models/InventoryHistory.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import { slugify } from '../utils/slugify.js';
export async function dashboard(req, res) {
  const [products, drafts, lowStock, orders, pendingReviews] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ status: 'draft' }),
    Product.countDocuments({ stockQuantity: { $lte: 9 } }),
    Order.countDocuments(),
    Review.countDocuments({ status: 'pending' }),
  ]);
  res.json({ products, drafts, lowStock, orders, pendingReviews });
}
export async function listProducts(req, res) {
  const { search = '', status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }];
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Math.min(Number(limit), 100)),
    Product.countDocuments(query),
  ]);
  res.json({ products, total });
}
export async function createProduct(req, res) {
  const body = req.validated.body;
  const slug = slugify(body.slug || body.name);
  if (await Product.exists({ $or: [{ slug }, { sku: body.sku.toUpperCase() }] }))
    throw new ApiError(409, 'A product with this slug or SKU already exists.');
  const product = await Product.create({ ...body, slug, sku: body.sku.toUpperCase() });
  res.status(201).json({ product });
}
export async function updateProduct(req, res) {
  const body = req.validated.body;
  if (body.slug || body.name) body.slug = slugify(body.slug || body.name);
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { ...body, sku: body.sku.toUpperCase() },
    { new: true, runValidators: true }
  );
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ product });
}
export async function adjustInventory(req, res) {
  const { quantity, reason } = req.validated.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  const oldQuantity = product.stockQuantity;
  product.stockQuantity = quantity;
  await product.save();
  await InventoryHistory.create({
    product: product._id,
    admin: req.user._id,
    oldQuantity,
    newQuantity: quantity,
    reason,
  });
  res.json({ product });
}
export async function inventoryHistory(req, res) {
  const history = await InventoryHistory.find({ product: req.params.id })
    .populate('admin', 'name email')
    .sort({ createdAt: -1 });
  res.json({ history });
}
export async function createOffer(req, res) {
  const data = req.validated.body;
  if (data.type === 'percentage' && data.value > 100)
    throw new ApiError(400, 'Percentage offers cannot exceed 100.');
  if (data.endsAt && data.startsAt && data.endsAt <= data.startsAt)
    throw new ApiError(400, 'Offer end must be after its start.');
  const offer = await Offer.create(data);
  res.status(201).json({ offer });
}
export async function listOffers(req, res) {
  res.json({
    offers: await Offer.find().populate('product', 'name sku regularPrice').sort({ createdAt: -1 }),
  });
}
export async function updateOffer(req, res) {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!offer) throw new ApiError(404, 'Offer not found.');
  res.json({ offer });
}
export async function listReviews(req, res) {
  const reviews = await Review.find(req.query.status ? { status: req.query.status } : {})
    .populate('product', 'name')
    .populate('customer', 'name email')
    .sort({ createdAt: -1 });
  res.json({ reviews });
}
export async function moderateReview(req, res) {
  const status = req.body.status;
  if (!['approved', 'rejected', 'hidden'].includes(status))
    throw new ApiError(400, 'Invalid review status.');
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) throw new ApiError(404, 'Review not found.');
  res.json({ review });
}
export async function listOrders(req, res) {
  const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
  res.json({ orders });
}
export async function updateOrder(req, res) {
  const { fulfillmentStatus } = req.body;
  if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(fulfillmentStatus))
    throw new ApiError(400, 'Invalid fulfillment status.');
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');
  order.fulfillmentStatus = fulfillmentStatus;
  if (fulfillmentStatus === 'delivered') order.deliveredAt ||= new Date();
  else order.deliveredAt = undefined;
  await order.save();
  res.json({ order });
}
