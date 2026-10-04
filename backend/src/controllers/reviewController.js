import Review from '../models/Review.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import { uploadImage } from '../services/imageService.js';
export async function submitReview(req, res) {
  const { rating, body } = req.validated.body;
  const productId = req.params.productId;
  const bought = await Order.exists({
    customer: req.user._id,
    fulfillmentStatus: 'delivered',
    'items.product': productId,
  });
  const review = await Review.findOneAndUpdate(
    { product: productId, customer: req.user._id },
    { rating, body, status: 'pending', verifiedPurchase: !!bought },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.status(201).json({ review, message: 'Your review is awaiting moderation.' });
}
export async function addReviewImages(req, res) {
  if (!req.files?.length) throw new ApiError(400, 'Select at least one review image.');
  const review = await Review.findOne({ product: req.params.productId, customer: req.user._id });
  if (!review) throw new ApiError(404, 'Submit your review before attaching images.');
  if (review.images.length + req.files.length > 5)
    throw new ApiError(400, 'A review can include up to five images.');
  const uploaded = await Promise.all(
    req.files.map((file) => uploadImage(file, `mitti-rituals/reviews/${review._id}`))
  );
  review.images.push(
    ...uploaded.map((image, index) => ({
      ...image,
      alt: req.body.alts?.[index] || 'Customer review image',
    }))
  );
  review.status = 'pending';
  await review.save();
  res.status(201).json({ review });
}
