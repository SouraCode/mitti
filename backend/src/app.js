import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import passport from './config/passport.js';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const localOrigins =
  process.env.NODE_ENV === 'production'
    ? []
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];
function normalizeOrigin(origin) {
  try {
    return new URL(origin.trim()).origin;
  } catch {
    return null;
  }
}

const allowedOrigins = new Set(
  [env.frontendUrl, env.adminUrl, ...env.corsOrigins, ...localOrigins]
    .map(normalizeOrigin)
    .filter(Boolean)
);

function isDevelopmentLoopbackOrigin(origin) {
  if (process.env.NODE_ENV === 'production') return false;
  try {
    const { protocol, hostname } = new URL(origin);
    return (
      (protocol === 'http:' || protocol === 'https:') &&
      ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
    );
  } catch {
    return false;
  }
}

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = express();

app.set('trust proxy', 1);
app.set('etag', false);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin)) || isDevelopmentLoopbackOrigin(origin))
        return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true,
  })
);
app.use(
  '/uploads',
  express.static(resolve(backendRoot, 'uploads'), {
    maxAge: '7d',
    immutable: true,
    fallthrough: false,
    setHeaders: (response) => response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  })
);
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false })
);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
