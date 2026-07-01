import type { Mood } from '@/features/mood/types';

export interface MoodColorSet {
  /** Full-strength color used for the tile fill and navbar tint. */
  base: string;
  /** Light tint (unused on dark canvas today; kept for parity with tokens). */
  soft: string;
  /** Dark shade used for pressed / low-emphasis states. */
  deep: string;
}

/**
 * Mood colors from the Figma design token board (Page 1).
 * Do NOT let these overlap with status/error colors (see Chrome.status*).
 */
export const MOOD_COLORS: Record<Mood, MoodColorSet> = {
  senang: { base: '#F5A623', soft: '#FBEFD3', deep: '#7B5312' },
  tenang: { base: '#8FB39B', soft: '#E4EFE8', deep: '#485A4E' },
  netral: { base: '#C2B19A', soft: '#F0EAE0', deep: '#61594D' },
  sedih: { base: '#7E9AC4', soft: '#E2E9F3', deep: '#3F4D62' },
  marah: { base: '#C9776A', soft: '#F5E2DD', deep: '#653C35' },
  cemas: { base: '#9D8BB5', soft: '#EBE5F1', deep: '#4F465B' },
};

/**
 * Neutral UI chrome. Background is pure black per the brief; text is a warm
 * off-white. `accent` (deep teal) is used sparingly and never overlaps a mood.
 */
export const Chrome = {
  background: '#000000',
  surface: '#0E0E10',
  surfaceElevated: '#161719',
  border: 'rgba(245, 240, 232, 0.08)',
  borderStrong: 'rgba(245, 240, 232, 0.16)',
  text: '#F5F0E8',
  textSecondary: 'rgba(245, 240, 232, 0.60)',
  textMuted: 'rgba(245, 240, 232, 0.38)',
  accent: '#2F7A73',
  statusError: '#E5484D',
  statusSuccess: '#30A46C',
} as const;
