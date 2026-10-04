import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import passport from '../config/passport.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validation/schemas.js';
import {
  register,
  login,
  logout,
  session,
  requestReset,
  resetPassword,
  googleCallback,
  verifyEmail,
  authProviders,
} from '../controllers/authController.js';
const router = Router();
const googleReady = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
);
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Try again in 15 minutes.' },
});
router.get('/providers', authProviders);
router.post('/register', loginLimiter, validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/session', authenticate, authorize('customer'), session);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', loginLimiter, validate(forgotPasswordSchema), requestReset);
router.post('/reset-password', loginLimiter, validate(resetPasswordSchema), resetPassword);
router.get('/google', (req, res, next) =>
  googleReady
    ? passport.authenticate('google', { scope: ['profile', 'email'], session: false })(
        req,
        res,
        next
      )
    : res
        .status(503)
        .json({
          message: 'Google sign-in is not configured. Email and password sign-in are available.',
        })
);
router.get(
  '/google/callback',
  googleReady
    ? passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?google=failed`,
      })
    : (req, res) => res.status(503).end(),
  googleCallback
);
export default router;
