// Mirrors app/schemas/entitlement.py — same shape the Flutter app's
// models.dart decodes, just in TypeScript.
export interface FeatureUsage {
  used: number;
  limit: number;
  period: 'lifetime' | 'weekly' | 'monthly';
  remaining: number;
  resets_at: string | null;
}

export interface GardenSetup {
  total: number;
  used: number;
  remaining: number;
}

export interface WishlistUsage {
  count: number;
  limit: number;
}

export interface Entitlement {
  plan: 'guest' | 'plantie' | 'green_thumb' | 'photosynthesis_phd';
  plan_display_name: string;
  subscription_status: 'free' | 'active' | 'expired';
  expires_at: string | null;
  is_guest: boolean;
  plant_count: number;
  plant_limit: number;
  wishlist: WishlistUsage;
  // Identify + Care Calculator + diagnose, unified into one shared pool —
  // see the backend's plans.py AI ACTIONS note for why this used to be
  // three separate fields on three different clocks.
  ai_actions: FeatureUsage;
  garden_setup: GardenSetup;
  next_plan: string | null;
  next_plan_display_name: string | null;
  // True while a paid subscription is active but scheduled to end at
  // cycle close — Account.tsx shows "Resume subscription" instead of
  // "Cancel subscription" whenever this is true (see backend's
  // billing_service.cancel_subscription / _resume_subscription).
  cancel_scheduled: boolean;
}

export interface SignInData {
  user_id: string;
  session_token: string;
  is_new_user: boolean;
  is_guest: boolean;
}

export interface CreateSubscriptionData {
  subscription_id: string;
  razorpay_key_id: string;
}

export interface SubscriptionStatusData {
  subscription_status: 'free' | 'active' | 'expired';
  plan: string | null;
  expires_at: string | null;
}

export interface ChangePlanData {
  plan: string;
  message: string;
  // Set when the account's active subscription is paid via UPI Autopay —
  // Razorpay's in-place plan-change endpoint doesn't support UPI mandates
  // (card-only), so the backend falls back to cancel-at-cycle-end + a new
  // subscription for the lower plan. That new mandate needs the same
  // Checkout confirmation as subscribing normally (see billing_service.py's
  // _change_plan_upi_fallback) — feature access already flipped by the
  // time this returns either way, so this is a "please also confirm the
  // new mandate" step, not a "did the downgrade even work" step.
  requires_checkout: boolean;
  subscription_id: string | null;
  razorpay_key_id: string | null;
}
