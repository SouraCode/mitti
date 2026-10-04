import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { signToken, randomToken, hashToken } from '../utils/tokens.js';
import { env } from '../config/env.js';
import { sendEmail, emailDeliveryConfigured } from '../services/emailService.js';
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
});
const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSecure ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};
const sessionCookie = (user) => (user.role === 'admin' ? 'admin_session' : 'customer_session');
const setSession = (res, user) => res.cookie(sessionCookie(user), signToken(user), cookieOptions);
export async function register(req, res) {
  const { name, email, password } = req.validated.body;
  if (await User.exists({ email }))
    throw new ApiError(409, 'An account with this email already exists.');
  const token = randomToken();
  const user = new User({ name, email, verificationToken: hashToken(token) });
  await user.setPassword(password);
  await user.save();
  const verificationSent = await sendEmail({
    to: user.email,
    subject: 'Verify your Mitti Rituals email',
    text: `Verify your email: ${env.frontendUrl}/verify-email?token=${token}`,
  });
  setSession(res, user);
  const message = verificationSent
    ? 'Your account is ready. Check your email to verify your address.'
    : emailDeliveryConfigured
      ? 'Your account is ready, but we could not send the verification email. Contact the store for help.'
      : 'Your account is ready. Email verification delivery is not configured yet.';
  res.status(201).json({ user: publicUser(user), verificationSent, message });
}
export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email: email.trim().toLowerCase(), role: 'customer' }).select(
    '+passwordHash'
  );
  if (!user || !user.passwordHash || !(await user.comparePassword(password)))
    throw new ApiError(401, 'Invalid email or password.');
  setSession(res, user);
  res.json({ user: publicUser(user) });
}
export function logout(req, res) {
  const isAdminRoute = req.baseUrl.includes('/admin');
  const cookieName = isAdminRoute ? 'admin_session' : 'customer_session';
  const options = {
    path: '/',
    sameSite: env.cookieSecure ? 'none' : 'lax',
    secure: env.cookieSecure,
  };
  res.clearCookie(cookieName, options);
  res.clearCookie('session', options);
  res.status(204).end();
}
export function session(req, res) {
  res.json({ user: publicUser(req.user) });
}
export async function requestReset(req, res) {
  const email = req.validated.body.email;
  const user = await User.findOne({ email, role: 'customer' });
  if (user && emailDeliveryConfigured) {
    const token = randomToken();
    user.passwordResetToken = hashToken(token);
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const sent = await sendEmail({
      to: user.email,
      subject: 'Reset your Mitti Rituals password',
      text: `Reset your password: ${env.frontendUrl}/reset-password?token=${token}`,
    });
    if (!sent) {
      user.passwordResetToken = undefined;
      user.passwordResetExpiresAt = undefined;
      await user.save();
    }
  }
  res.json({
    message: emailDeliveryConfigured
      ? 'If an account exists, reset instructions will be sent.'
      : 'Password reset email is unavailable because store email delivery is not configured yet.',
  });
}
export async function resetPassword(req, res) {
  const { token, password } = req.validated.body;
  const user = await User.findOne({
    role: 'customer',
    passwordResetToken: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordHash');
  if (!user) throw new ApiError(400, 'This reset link is invalid or has expired.');
  await user.setPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  setSession(res, user);
  res.json({ user: publicUser(user) });
}
export async function verifyEmail(req, res) {
  const user = await User.findOne({
    role: 'customer',
    verificationToken: hashToken(req.query.token || ''),
  });
  if (!user) throw new ApiError(400, 'This verification link is invalid or has expired.');
  user.isEmailVerified = true;
  user.verificationToken = undefined;
  await user.save();
  res.json({ message: 'Email verified. You can now use your account.' });
}
export async function googleCallback(req, res) {
  setSession(res, req.user);
  res.redirect(`${env.frontendUrl}/account`);
}
export function authProviders(req, res) {
  res.json({
    emailPassword: true,
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CALLBACK_URL
    ),
    emailDelivery: emailDeliveryConfigured,
  });
}
export async function adminLogin(req, res) {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (
    !user ||
    user.role !== 'admin' ||
    !user.passwordHash ||
    !(await user.comparePassword(password))
  )
    throw new ApiError(401, 'Invalid admin credentials.');
  setSession(res, user);
  res.json({ user: publicUser(user) });
}
