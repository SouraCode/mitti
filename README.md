# Mitti Rituals

This project contains a public storefront, a protected administration app, and an Express/MongoDB API. The database is intentionally unseeded: no sample products, prices, stock, orders, reviews, or administrator credentials are included.

## Structure

- `frontend/` — responsive public storefront (React + Vite)
- `backend/` — Express API, MongoDB models, controllers, routes, validation, middleware, and services
- `admin/` — protected React administration app

## Run the storefront

```bash
cd frontend
npm install
npm run dev
```

The storefront runs on `http://localhost:5173`.

## Run the API

Copy `backend/.env.example` to `backend/.env`, supply the required values, then run:

```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:5000`. Create the only initial administrator securely after setting `FIRST_ADMIN_NAME`, `FIRST_ADMIN_EMAIL`, and `FIRST_ADMIN_PASSWORD` in the backend environment:

```bash
npm run seed:first-admin
```

There is no public admin registration route and no default password.

## Run the admin app

```bash
cd admin
npm install
npm run dev
```

The admin app runs on `http://localhost:3000/admin/login`. For a production deployment, configure the host to rewrite `/admin/*` to `admin/index.html` so refreshes retain the React route.

## Environment values to provide

- `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, and `ADMIN_URL`
- Google OAuth values (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`) if Google login is wanted

For Google sign-in, create a **Web application** OAuth client in Google Cloud and add the exact callback URL used by the API to its Authorized redirect URIs. For local development, that is `http://localhost:5000/api/auth/google/callback`. Add your storefront URL (for example, `http://localhost:5173`) to Authorized JavaScript origins. Keep the client secret in `backend/.env` only; the client never receives it.
- SMTP values and `EMAIL_FROM` to send verification and reset emails
- Cloudinary values for durable product/review image storage; without them, uploaded product photos are stored under `backend/uploads` (use persistent writable storage in production). Set `API_PUBLIC_URL` if the API is behind a proxy and needs a canonical public image URL.
- Payment provider values, or explicitly set `COD_ENABLED=true` if cash on delivery is a real business option
- `DELIVERY_ESTIMATE_BUSINESS_DAYS` controls the order ETA shown to customers (defaults to five business days and can be adjusted for your fulfillment process)

## Current frontend behaviour

Product calls are isolated in `frontend/src/services/api.js` and route through the API. Until real products are created and published in the admin app, the shop displays intentional empty states rather than sample products, prices, claims, or stock.

## Verification

The storefront and admin production builds complete successfully. Backend JavaScript files pass Node syntax checks. Runtime integration requires the MongoDB and credential values above.
# mitti
