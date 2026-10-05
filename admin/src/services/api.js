const base =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api');
async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new Error(`Cannot reach the API at ${base}. Start the backend and try again.`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
export const adminApi = {
  login: (body) => api('/admin/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => api('/admin/logout', { method: 'POST' }),
  session: () => api('/admin/session'),
  dashboard: () => api('/admin/dashboard'),
  products: (query = '') => api(`/admin/products${query}`),
  categories: () => api('/admin/categories'),
  createCategory: (name) => api('/admin/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  uploadCategoryImage: (id, form) => api(`/admin/categories/${id}/image`, { method: 'POST', body: form }),
  removeCategory: (id) => api(`/admin/categories/${id}`, { method: 'DELETE' }),
  createProduct: (body) => api('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) =>
    api(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  inventory: (id, body) =>
    api(`/admin/products/${id}/inventory`, { method: 'PATCH', body: JSON.stringify(body) }),
  history: (id) => api(`/admin/products/${id}/inventory-history`),
  offers: () => api('/admin/offers'),
  createOffer: (body) => api('/admin/offers', { method: 'POST', body: JSON.stringify(body) }),
  updateOffer: (id, body) =>
    api(`/admin/offers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  reviews: (status = '') => api(`/admin/reviews${status ? `?status=${status}` : ''}`),
  moderate: (id, status) =>
    api(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  orders: () => api('/admin/orders'),
  updateOrder: (id, fulfillmentStatus) =>
    api(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ fulfillmentStatus }) }),
  uploadImages: (id, form) => api(`/admin/products/${id}/images`, { method: 'POST', body: form }),
};
