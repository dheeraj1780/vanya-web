// Same env-driven base URL pattern as the Flutter app's ApiClient — set
// via VITE_API_BASE_URL at build/dev time. Defaults to the real deployed
// Render backend (Vercel's own build already sets VITE_API_BASE_URL to
// this same value; this fallback just keeps a plain local `npm run dev`
// pointed somewhere real too).
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'https://vanya-backend-64ja.onrender.com/v1';

// Mirrors app/core/plans.py / lib/config/plans.dart — display-only, exact
// same values. If pricing changes, update all three.
export interface PlanConfig {
  key: 'guest' | 'plantie' | 'green_thumb' | 'photosynthesis_phd';
  displayName: string;
  tagline: string;
  emoji: string;
  priceInr: number;
  maxPlants: number;
  wishlistLimit: number;
  gardenSetupIdentifications: number;
  identification: { limit: number; period: string };
  careCalculator: { limit: number; period: string };
  diagnose: { limit: number; period: string };
}

export const PLANS: Record<string, PlanConfig> = {
  plantie: {
    key: 'plantie',
    displayName: 'Plantie',
    tagline: 'Start your plant journey.',
    emoji: '🌱',
    priceInr: 0,
    maxPlants: 3,
    wishlistLimit: 5,
    gardenSetupIdentifications: 0,
    identification: { limit: 1, period: 'week' },
    careCalculator: { limit: 2, period: 'week' },
    diagnose: { limit: 1, period: 'month' },
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
    identification: { limit: 3, period: 'week' },
    careCalculator: { limit: 7, period: 'week' },
    diagnose: { limit: 2, period: 'month' },
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
    identification: { limit: 10, period: 'week' },
    careCalculator: { limit: 20, period: 'week' },
    diagnose: { limit: 5, period: 'month' },
  },
};

export const PAID_PLAN_ORDER = ['green_thumb', 'photosynthesis_phd'] as const;
