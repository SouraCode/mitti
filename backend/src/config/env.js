import 'dotenv/config';
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
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  codEnabled: process.env.COD_ENABLED === 'true',
  deliveryEstimateBusinessDays: Math.min(
    30,
    Math.max(1, Number.parseInt(process.env.DELIVERY_ESTIMATE_BUSINESS_DAYS || '5', 10) || 5)
  ),
};
