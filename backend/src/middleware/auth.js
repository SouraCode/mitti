import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
export async function authenticate(req, res, next) {
  try {
    const cookieName = req.baseUrl.includes('/admin') ? 'admin_session' : 'customer_session';
    const token =
      req.cookies[cookieName] ||
      req.cookies.session ||
      req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new ApiError(401, 'Authentication is required.');
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, 'Your session is no longer valid.');
    req.user = user;
    next();
  } catch (error) {
    next(error.status ? error : new ApiError(401, 'Authentication is required.'));
  }
}
export const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : next(new ApiError(403, 'You do not have access to this resource.'));
