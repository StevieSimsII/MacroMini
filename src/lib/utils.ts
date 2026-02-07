/** Utility: merge classNames (Tailwind-safe) */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/** Format a number with commas */
export function formatNumber(n: number, decimals = 0): string {
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Capitalize first letter */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Generate a storage path for a user's food image */
export function storagePath(userId: string, filename: string): string {
  const ts = Date.now();
  const ext = filename.split('.').pop() || 'jpg';
  return `${userId}/${ts}.${ext}`;
}

/** Meal type display order */
export const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

/** Status labels */
export const STATUS_LABELS: Record<string, string> = {
  consumed: 'Consumed',
  about_to_consume: 'About to eat',
  about_to_purchase: 'About to buy',
};

/** Macro colors (monochrome shades for charts) */
export const MACRO_COLORS = {
  calories: '#1a1a1a',
  protein: '#555555',
  carbs: '#888888',
  fat: '#bbbbbb',
} as const;
