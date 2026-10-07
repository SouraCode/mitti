import { z } from 'zod';
const obj = (body) =>
  z.object({ body, query: z.object({}).passthrough(), params: z.object({}).passthrough() });
const email = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());
export const loginSchema = obj(z.object({ email, password: z.string().min(1).max(128) }));
export const registerSchema = obj(
  z.object({ email, password: z.string().min(8).max(128), name: z.string().trim().min(2).max(80) })
);
export const credentialsSchema = obj(
  z.object({
    email,
    password: z.string().min(1).max(128),
    name: z.string().trim().min(2).max(80).optional(),
  })
);
export const resetPasswordSchema = obj(
  z.object({ token: z.string().min(32).max(256), password: z.string().min(8).max(128) })
);
export const forgotPasswordSchema = obj(z.object({ email }));
export const productSchema = obj(
  z.object({
    name: z.string().trim().min(2).max(160),
    slug: z.string().trim().min(2).optional(),
    sku: z.string().trim().min(1).max(64),
    category: z.string().trim().min(2).max(80),
    shortDescription: z.string().max(350).optional().default(''),
    description: z.string().max(5000).optional().default(''),
    ingredients: z.array(z.string().trim().min(1).max(300)).optional().default([]),
    directions: z.string().max(3000).optional().default(''),
    regularPrice: z.coerce.number().min(0),
    stockQuantity: z.coerce.number().int().min(0).optional(),
    lowStockThreshold: z.coerce.number().int().min(0).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  })
);
export const offerSchema = obj(
  z.object({
    product: z.string().length(24),
    type: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().positive(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    enabled: z.coerce.boolean().optional(),
  })
);
export const inventorySchema = obj(
  z.object({ quantity: z.coerce.number().int().min(0), reason: z.string().trim().min(2).max(300) })
);
export const categorySchema = obj(z.object({ name: z.string().trim().min(2).max(80) }));
export const reviewSchema = obj(
  z.object({
    rating: z.coerce.number().int().min(1).max(5),
    body: z.string().trim().max(1500).optional().default(''),
  })
);
export const razorpayCreateOrderSchema = obj(
  z.object({
    items: z
      .array(
        z.object({
          productId: z.string().length(24),
          quantity: z.coerce.number().int().min(1).max(4),
        })
      )
      .min(1),
    deliveryAddress: z.object({
      name: z.string().trim().min(1).max(120),
      phone: z.string().trim().min(7).max(30),
      line1: z.string().trim().min(1).max(200),
      line2: z.string().trim().max(200).optional().default(''),
      city: z.string().trim().min(1).max(120),
      state: z.string().trim().min(1).max(120),
      postalCode: z.string().trim().min(1).max(40),
      country: z.string().trim().min(1).max(120),
    }),
  })
);
export const razorpayVerifySchema = obj(
  z.object({
    razorpay_payment_id: z.string().trim().min(1),
    razorpay_order_id: z.string().trim().min(1),
    razorpay_signature: z.string().trim().min(1),
  })
);
