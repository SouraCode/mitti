import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  credentialsSchema,
  productSchema,
  offerSchema,
  inventorySchema,
} from '../validation/schemas.js';
import { adminLogin, logout, session } from '../controllers/authController.js';
import * as admin from '../controllers/adminController.js';
import { productImages } from '../middleware/upload.js';
import {
  addProductImages,
  removeProductImage,
  reorderProductImages,
  setPrimaryImage,
} from '../controllers/imageController.js';
const router = Router();
router.post('/login', validate(credentialsSchema), adminLogin);
router.post('/logout', logout);
router.get('/session', authenticate, authorize('admin'), session);
router.use(authenticate, authorize('admin'));
router.get('/dashboard', admin.dashboard);
router.get('/products', admin.listProducts);
router.post('/products', validate(productSchema), admin.createProduct);
router.patch('/products/:id', validate(productSchema), admin.updateProduct);
router.patch('/products/:id/inventory', validate(inventorySchema), admin.adjustInventory);
router.get('/products/:id/inventory-history', admin.inventoryHistory);
router.post('/products/:id/images', productImages, addProductImages);
router.patch('/products/:id/images/order', reorderProductImages);
router.patch('/products/:id/images/:imageId/primary', setPrimaryImage);
router.delete('/products/:id/images/:imageId', removeProductImage);
router.get('/offers', admin.listOffers);
router.post('/offers', validate(offerSchema), admin.createOffer);
router.patch('/offers/:id', admin.updateOffer);
router.get('/reviews', admin.listReviews);
router.patch('/reviews/:id', admin.moderateReview);
router.get('/orders', admin.listOrders);
router.patch('/orders/:id', admin.updateOrder);
export default router;
