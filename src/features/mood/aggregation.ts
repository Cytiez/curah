import type { MoodLog } from './types';

/**
 * Pure mood-aggregation logic. No React / RN imports so it stays trivially
 * unit-testable.
 */

export type DayPeriod = 'pagi' | 'siang' | 'sore' | 'malam';

export const PERIOD_LABEL: Record<DayPeriod, string> = {
  pagi: 'Pagi',
  siang: 'Siang',
  sore: 'Sore',
  malam: 'Malam',
};

/** Order top-of-glass (latest) to bottom (earliest), matching the wireframe. */
export const PERIOD_ORDER: readonly DayPeriod[] = ['malam', 'sore', 'siang', 'pagi'];

/** Maps a timestamp to a coarse time-of-day bucket. Malam wraps past midnight. */
export function periodOfDay(date: Date): DayPeriod {
  const h = date.getHours();
  if (h >= 5 && h < 11) return 'pagi';
  if (h >= 11 && h < 15) return 'siang';
  if (h >= 15 && h < 18) return 'sore';
  return 'malam';
}

/** True when both dates fall on the same local calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface GlassBand {
  log: MoodLog;
  period: DayPeriod;
}

/**
 * Today's logs as discrete, stratified bands for the "Gelas Hari Ini" glass.
 * Each log becomes ITS OWN band (never blended), newest first (top of glass).
 * Two logs in the same period still yield two separate bands.
 */
export function stratifyDayLogs(logs: MoodLog[], now: Date = new Date()): GlassBand[] {
  return logs
    .filter((log) => isSameDay(new Date(log.createdAt), now))
    .sort((a, b) => toTime(b) - toTime(a))
    .map((log) => ({ log, period: periodOfDay(new Date(log.createdAt)) }));
}

/**
 * Chronological feed timeline (newest first) of shared logs only. Private logs
 * never surface here. Multiple logs from one person appear as separate events.
 */
export function buildFeedTimeline(logs: MoodLog[]): MoodLog[] {
  return logs
    .filter((log) => log.visibility === 'shared')
    .sort((a, b) => toTime(b) - toTime(a));
}

/**
 * The latest SHARED mood per user (e.g. for a per-person "current mood" tint).
 * Private logs are ignored.
 */
export function latestSharedPerUser(logs: MoodLog[]): Record<string, MoodLog> {
  const out: Record<string, MoodLog> = {};
  for (const log of logs) {
    if (log.visibility !== 'shared') continue;
    const current = out[log.userId];
    if (!current || toTime(log) > toTime(current)) {
      out[log.userId] = log;
    }
  }
  return out;
}

function toTime(log: MoodLog): number {
  return new Date(log.createdAt).getTime();
}
