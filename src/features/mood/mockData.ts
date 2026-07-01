import type { Mood, MoodLog, Visibility } from './types';

/**
 * Mock data for Fase 1 (UI-first, no backend yet). Timestamps are generated
 * relative to `now` so the Recap glass and Feed always show fresh "today" data.
 */

export interface CircleUser {
  id: string;
  name: string;
}

export const CURRENT_USER_ID = 'me';

export const CURRENT_USER: CircleUser = { id: CURRENT_USER_ID, name: 'Kamu' };

/** Friends in the circle (cap is 10; this is a small sample). */
export const CIRCLE_USERS: CircleUser[] = [
  { id: 'ayu', name: 'Ayu' },
  { id: 'bima', name: 'Bima' },
  { id: 'citra', name: 'Citra' },
  { id: 'dewi', name: 'Dewi' },
];

export const USERS_BY_ID: Record<string, CircleUser> = Object.fromEntries(
  [CURRENT_USER, ...CIRCLE_USERS].map((u) => [u.id, u]),
);

interface Seed {
  userId: string;
  hour: number;
  minute: number;
  mood: Mood;
  visibility: Visibility;
}

const SEEDS: Seed[] = [
  // Current user's day — drives the Recap glass (mix of shared + private).
  { userId: 'me', hour: 8, minute: 15, mood: 'tenang', visibility: 'shared' },
  { userId: 'me', hour: 12, minute: 30, mood: 'senang', visibility: 'private' },
  { userId: 'me', hour: 16, minute: 45, mood: 'netral', visibility: 'shared' },
  { userId: 'me', hour: 21, minute: 10, mood: 'cemas', visibility: 'shared' },
  // Friends — drive the Feed timeline.
  { userId: 'ayu', hour: 7, minute: 50, mood: 'senang', visibility: 'shared' },
  { userId: 'ayu', hour: 13, minute: 20, mood: 'marah', visibility: 'shared' },
  { userId: 'bima', hour: 10, minute: 5, mood: 'sedih', visibility: 'shared' },
  { userId: 'citra', hour: 15, minute: 30, mood: 'tenang', visibility: 'shared' },
  { userId: 'citra', hour: 19, minute: 40, mood: 'senang', visibility: 'shared' },
  { userId: 'dewi', hour: 9, minute: 15, mood: 'cemas', visibility: 'shared' },
];

/** Builds the seeded mock logs anchored to `now`'s calendar day. */
export function makeMockLogs(now: Date = new Date()): MoodLog[] {
  return SEEDS.map((seed, i) => {
    const at = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      seed.hour,
      seed.minute,
    );
    return {
      id: `mock-${seed.userId}-${i}`,
      userId: seed.userId,
      mood: seed.mood,
      visibility: seed.visibility,
      createdAt: at.toISOString(),
    } satisfies MoodLog;
  });
}
