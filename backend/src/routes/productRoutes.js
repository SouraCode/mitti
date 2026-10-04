import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validation/schemas.js';
import { submitReview, addReviewImages } from '../controllers/reviewController.js';
import { reviewImages } from '../middleware/upload.js';
const router = Router();
router.get('/', listProducts);
router.get('/:slug', getProduct);
router.post(
  '/:productId/reviews',
  authenticate,
  authorize('customer'),
  validate(reviewSchema),
  submitReview
);
router.post(
  '/:productId/reviews/images',
  authenticate,
  authorize('customer'),
  reviewImages,
  addReviewImages
);
export default router;
