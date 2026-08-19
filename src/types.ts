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
  identification: FeatureUsage;
  care_calculator: FeatureUsage;
  diagnose: FeatureUsage;
  garden_setup: GardenSetup;
  next_plan: string | null;
  next_plan_display_name: string | null;
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
