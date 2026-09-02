// Same env-driven base URL pattern as the Flutter app's ApiClient — set
// via VITE_API_BASE_URL at build/dev time. Defaults to the real deployed
// Render backend (Vercel's own build already sets VITE_API_BASE_URL to
// this same value; this fallback just keeps a plain local `npm run dev`
// pointed somewhere real too).
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'https://vanya-backend-64ja.onrender.com/v1';

// Mirrors app/core/plans.py / lib/config/plans.dart — display-only, exact
// same values. If pricing changes, update all three.
//
// This mirror had drifted from the actual backend values in several
// places (wrong Plantie numbers, no guest entry, no growth-memory field)
// before this rewrite -- fixed alongside the aiActions consolidation
// below, not just patched around it.
export interface PlanConfig {
  key: 'guest' | 'plantie' | 'green_thumb' | 'photosynthesis_phd';
  displayName: string;
  tagline: string;
  emoji: string;
  priceInr: number;
  maxPlants: number;
  wishlistLimit: number;
  gardenSetupIdentifications: number;
  // Identify + Care Calculator + diagnose, unified into one shared pool
  // -- see plans.py's AI ACTIONS note for why this used to be three
  // separate allowances on three different clocks. period is 'week' for
  // every signed-in tier, 'lifetime' for guest (a one-time trial, not an
  // ongoing relationship).
  aiActions: { limit: number; period: string };
  // Persistent slots for dated photo memories, same PLANT COLLECTION
  // RULES semantics as maxPlants. 0 = not offered on this tier; -1 =
  // unlimited.
  growthMemoryLimit: number;
}

export const PLANS: Record<string, PlanConfig> = {
  guest: {
    key: 'guest',
    displayName: 'Guest',
    tagline: 'Try VANYA before you sign in.',
    emoji: '🌾',
    priceInr: 0,
    maxPlants: 3,
    wishlistLimit: 3,
    gardenSetupIdentifications: 0,
    aiActions: { limit: 6, period: 'lifetime' },
    growthMemoryLimit: 0,
  },
  plantie: {
    key: 'plantie',
    displayName: 'Plantie',
    tagline: 'Start your plant journey.',
    emoji: '🌱',
    priceInr: 0,
    maxPlants: 5,
    wishlistLimit: 5,
    gardenSetupIdentifications: 0,
    aiActions: { limit: 6, period: 'week' },
    growthMemoryLimit: 0,
  },
  green_thumb: {
    key: 'green_thumb',
    displayName: 'Green Thumb',
    tagline: 'Grow your garden with confidence.',
    emoji: '🌿',
    priceInr: 99,
    maxPlants: 10,
    wishlistLimit: 20,
    gardenSetupIdentifications: 10,
    aiActions: { limit: 15, period: 'week' },
    growthMemoryLimit: 4,
  },
  photosynthesis_phd: {
    key: 'photosynthesis_phd',
    displayName: 'Photosynthesis PhD',
    tagline: 'For those who take plants seriously.',
    emoji: '🌳',
    priceInr: 199,
    maxPlants: 25,
    wishlistLimit: 50,
    gardenSetupIdentifications: 25,
    aiActions: { limit: 35, period: 'week' },
    growthMemoryLimit: -1,
  },
};

export const PAID_PLAN_ORDER = ['green_thumb', 'photosynthesis_phd'] as const;

// Mirrors the Flutter app's kAppleSignInEnabled (lib/config/feature_flags.dart)
// — Apple sign-in hidden on both platforms for now, until Apple's own
// Service ID / web-auth setup is finished on the Apple Developer console.
export const APPLE_SIGN_IN_ENABLED = false;
