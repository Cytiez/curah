/**
 * Mood domain types.
 *
 * Mood set follows the Figma design tokens (Page 1), which define six moods
 * each with an official color. Tiles are color-only in the UI; labels are used
 * internally and in the Recap screen.
 */

export type Mood = 'senang' | 'tenang' | 'netral' | 'sedih' | 'marah' | 'cemas';

export const MOODS = [
  'senang',
  'tenang',
  'netral',
  'sedih',
  'marah',
  'cemas',
] as const satisfies readonly Mood[];

export const MOOD_LABEL: Record<Mood, string> = {
  senang: 'Senang',
  tenang: 'Tenang',
  netral: 'Netral',
  sedih: 'Sedih',
  marah: 'Marah',
  cemas: 'Cemas',
};

export type Visibility = 'private' | 'shared';

/** A single mood check-in. `createdAt` is an ISO 8601 timestamp. */
export interface MoodLog {
  id: string;
  userId: string;
  mood: Mood;
  visibility: Visibility;
  createdAt: string;
}
