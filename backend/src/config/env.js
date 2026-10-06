import 'dotenv/config';

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() || '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || '';
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL?.trim() || '';
const required = ['MONGODB_URI', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'production')
  required.forEach((key) => {
    if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
  });
export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:3000',
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  codEnabled: process.env.COD_ENABLED === 'true',
  razorpay: {
    enabled: process.env.RAZORPAY_ENABLED === 'true',
    keyId: process.env.RAZORPAY_KEY_ID?.trim() || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET?.trim() || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || '',
  },
  google: {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    callbackUrl: googleCallbackUrl,
    configured: Boolean(googleClientId && googleClientSecret && googleCallbackUrl),
  },
  deliveryEstimateBusinessDays: Math.min(
    30,
    Math.max(1, Number.parseInt(process.env.DELIVERY_ESTIMATE_BUSINESS_DAYS || '5', 10) || 5)
  ),
};
