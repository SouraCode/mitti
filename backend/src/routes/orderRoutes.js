import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { createOrder, myOrders, paymentOptions } from '../controllers/orderController.js';
const router = Router();
router.use(authenticate, authorize('customer'));
router.get('/mine', myOrders);
router.get('/payment-options', paymentOptions);
router.post('/', createOrder);
export default router;
