import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import Review from '../models/Review.js';
import ApiError from '../utils/ApiError.js';
import { effectivePrice } from '../utils/pricing.js';
const publicProduct = (product, offers = [], rating = {}) => {
  const price = effectivePrice(product, offers);
  const stock =
    product.stockQuantity === 0
      ? { state: 'out_of_stock', label: 'Out of stock' }
      : product.stockQuantity < 10
        ? { state: 'low_stock', label: `Only ${product.stockQuantity} left.` }
        : { state: 'in_stock', label: 'In stock' };
  const images = [...product.images]
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
    .map(({ url, alt, isPrimary }) => ({ url, alt, isPrimary }));
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description,
    ingredients: product.ingredients,
    directions: product.directions,
    images,
    regularPrice: product.regularPrice,
    price: price.price,
    offer: price.offer,
    stock,
    rating: { average: rating.average || 0, count: rating.count || 0 },
  };
};
export async function listProducts(req, res) {
  const { page = 1, limit = 12, category, search, sort = 'newest', featured } = req.query;
  const query = { status: 'published' };
  if (category) query.category = category;
  if (search) query.$text = { $search: search };
  const sortMap = {
    newest: { createdAt: -1 },
    'price-asc': { regularPrice: 1 },
    'price-desc': { regularPrice: -1 },
  };
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((Number(page) - 1) * Math.min(Number(limit), 48))
      .limit(Math.min(Number(limit), 48)),
    Product.countDocuments(query),
  ]);
  const ids = products.map((p) => p._id);
  const [offers, ratingRows] = await Promise.all([
    Offer.find({ product: { $in: ids }, enabled: true }),
    Review.aggregate([
      { $match: { product: { $in: ids }, status: 'approved' } },
      { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);
  const offerMap = new Map(
    ids.map((id) => [id.toString(), offers.filter((o) => o.product.equals(id))])
  );
  const ratingMap = new Map(ratingRows.map((r) => [r._id.toString(), r]));
  res.json({
    products: products.map((p) =>
      publicProduct(p, offerMap.get(p._id.toString()), ratingMap.get(p._id.toString()))
    ),
    pagination: {
      page: Number(page),
      total,
      pages: Math.ceil(total / Math.min(Number(limit), 48)),
    },
  });
}
export async function getProduct(req, res) {
  const product = await Product.findOne({ slug: req.params.slug, status: 'published' });
  if (!product) throw new ApiError(404, 'Product not found.');
  const [offers, ratingRows, reviews] = await Promise.all([
    Offer.find({ product: product._id, enabled: true }),
    Review.aggregate([
      { $match: { product: product._id, status: 'approved' } },
      { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    Review.find({ product: product._id, status: 'approved' })
      .populate('customer', 'name')
      .select('rating body images verifiedPurchase customer createdAt'),
  ]);
  res.json({ product: publicProduct(product, offers, ratingRows[0]), reviews });
}
export { publicProduct };
