# VANYA — website

Where VANYA subscriptions are actually sold. The Flutter app has **zero**
in-app purchase UI — Google Play's "reader app" / consumption-only
exemption means an app with no purchase flow at all pays Google 0%
commission (vs. 15-30% through Play Billing). This site is that purchase
flow, and it's what `paywall_screen.dart`'s "Continue on vanya.app" button
and Settings' "Manage on vanya.app" button open in the device's browser.

See `../plant-companion-backend/app/services/billing_service.py`'s module
docstring for the full reasoning, and `../plant-companion-flutter_2/README.md`.

## Why the same account works on both app and website

Both this site and the Flutter app authenticate against the **same
Firebase project**. Firebase issues the same stable UID for a given
Google/Apple account regardless of platform, and the backend's
`POST /auth/signin` (called identically from both) keys everything off
that UID — so signing in here with the same Google account you use in the
app resolves to the exact same `user_id`, and a subscription bought here
shows up in the app automatically (see `AuthContext.tsx`).

## Pages

- `/` — landing/marketing
- `/upgrade` — the pricing/checkout page (Razorpay Checkout.js)
- `/account` — current plan, usage, cancel subscription

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your real backend
npm run dev
```

### Razorpay
Nothing to configure here — the **public** Razorpay key comes back from
the backend's `POST /billing/razorpay/create-subscription` response
(`razorpay_key_id`), so this site never needs its own Razorpay
credentials. Checkout.js itself is loaded via the `<script>` tag in
`index.html` (Razorpay's own recommended integration, not an npm package).

## Deploying

Any static host works (Vercel, Netlify, Cloudflare Pages) — this is a
plain Vite SPA, no server-side rendering. Two things to get right:
1. Set `VITE_API_BASE_URL` to the real, stable backend URL at build time.
2. Configure the host's rewrite rules so `/upgrade` and `/account` serve
   `index.html` (client-side routing via `react-router-dom`) instead of
   404ing on a direct load/refresh.
