const defaultApiUrl =
  typeof window !== 'undefined' && import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api';
const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      cache: 'no-store',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error(
      `Cannot reach the sign-in service at ${API_URL}. Start the backend and try again.`
    );
  }
  if (!response.ok)
    throw new Error((await response.json().catch(() => ({}))).message || 'Something went wrong.');
  if (response.status === 204) return null;
  return response.json();
}

export const productsApi = {
  list: (params = {}) => request(`/products?${new URLSearchParams(params)}`),
  getBySlug: (slug) => request(`/products/${slug}`),
};
export const categoriesApi = {
  list: () => request('/categories'),
};
export const authApi = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: (token) => request(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  session: () => request('/auth/session'),
  logout: () => request('/auth/logout', { method: 'POST' }),
};
export const authProvidersApi = () => request('/auth/providers');
export const ordersApi = {
  mine: () => request('/orders/mine'),
  getMine: (orderId) => request(`/orders/mine/${encodeURIComponent(orderId)}`),
  paymentOptions: () => request('/orders/payment-options'),
  create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
};
export const paymentsApi = {
  options: () => request('/payments/options'),
  createOrder: (body) =>
    request('/payments/razorpay/create-order', { method: 'POST', body: JSON.stringify(body) }),
  verify: (body) =>
    request('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(body) }),
};
