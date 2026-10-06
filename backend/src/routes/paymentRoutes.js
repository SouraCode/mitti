import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  razorpayCreateOrderSchema,
  razorpayVerifySchema,
} from '../validation/schemas.js';
import {
  createRazorpayPaymentOrder,
  handleRazorpayWebhook,
  paymentOptions,
  verifyRazorpayPayment,
} from '../controllers/paymentController.js';

const router = Router();

router.get('/options', paymentOptions);
router.post(
  '/razorpay/create-order',
  authenticate,
  authorize('customer'),
  validate(razorpayCreateOrderSchema),
  createRazorpayPaymentOrder
);
router.post(
  '/razorpay/verify',
  authenticate,
  authorize('customer'),
  validate(razorpayVerifySchema),
  verifyRazorpayPayment
);
router.post('/razorpay/webhook', handleRazorpayWebhook);

export default router;
