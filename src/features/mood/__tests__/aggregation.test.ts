import {
  buildFeedTimeline,
  latestSharedPerUser,
  periodOfDay,
  stratifyDayLogs,
} from '@/features/mood/aggregation';
import type { MoodLog } from '@/features/mood/types';

const DAY = { y: 2026, m: 6, d: 1 }; // 1 Jul 2026 (month is 0-indexed)

function log(
  partial: Partial<MoodLog> & { hour: number; minute?: number },
): MoodLog {
  const { hour, minute = 0, ...rest } = partial;
  return {
    id: rest.id ?? `l-${hour}-${minute}-${rest.userId ?? 'me'}`,
    userId: rest.userId ?? 'me',
    mood: rest.mood ?? 'netral',
    visibility: rest.visibility ?? 'shared',
    createdAt: new Date(DAY.y, DAY.m, DAY.d, hour, minute).toISOString(),
  };
}

const NOW = new Date(DAY.y, DAY.m, DAY.d, 22, 0);

describe('periodOfDay', () => {
  it('buckets hours into pagi/siang/sore/malam with correct boundaries', () => {
    expect(periodOfDay(new Date(DAY.y, DAY.m, DAY.d, 5, 0))).toBe('pagi');
    expect(periodOfDay(new Date(DAY.y, DAY.m, DAY.d, 10, 59))).toBe('pagi');
    expect(periodOfDay(new Date(DAY.y, DAY.m, DAY.d, 11, 0))).toBe('siang');
    expect(periodOfDay(new Date(DAY.y, DAY.m, DAY.d, 14, 59))).toBe('siang');
    expect(periodOfDay(new Date(DAY.y, DAY.m, DAY.d, 15, 0))).toBe('sore');
    expect(periodOfDay(new Date(DAY.y, DAY.m, DAY.d, 17, 59))).toBe('sore');
    expect(periodOfDay(new Date(DAY.y, DAY.m, DAY.d, 18, 0))).toBe('malam');
    expect(periodOfDay(new Date(DAY.y, DAY.m, DAY.d, 3, 0))).toBe('malam');
  });
});

describe('stratifyDayLogs', () => {
  it('returns one discrete band per log, newest first', () => {
    const logs = [
      log({ hour: 8, mood: 'tenang' }),
      log({ hour: 16, mood: 'netral' }),
      log({ hour: 21, mood: 'cemas' }),
    ];
    const bands = stratifyDayLogs(logs, NOW);
    expect(bands.map((b) => b.log.mood)).toEqual(['cemas', 'netral', 'tenang']);
    expect(bands.map((b) => b.period)).toEqual(['malam', 'sore', 'pagi']);
  });

  it('keeps two same-period logs as two separate bands (no blend)', () => {
    const logs = [
      log({ hour: 11, mood: 'senang', id: 'a' }),
      log({ hour: 13, mood: 'marah', id: 'b' }),
    ];
    const bands = stratifyDayLogs(logs, NOW);
    expect(bands).toHaveLength(2);
    expect(bands.every((b) => b.period === 'siang')).toBe(true);
    expect(bands.map((b) => b.log.id)).toEqual(['b', 'a']);
  });

  it('excludes logs from other days', () => {
    const today = log({ hour: 9, mood: 'senang' });
    const yesterday: MoodLog = {
      ...log({ hour: 9, mood: 'marah', id: 'y' }),
      createdAt: new Date(DAY.y, DAY.m, DAY.d - 1, 9, 0).toISOString(),
    };
    const bands = stratifyDayLogs([today, yesterday], NOW);
    expect(bands).toHaveLength(1);
    expect(bands[0].log.id).toBe(today.id);
  });
});

describe('buildFeedTimeline', () => {
  it('excludes private logs and sorts newest first', () => {
    const logs = [
      log({ hour: 7, userId: 'ayu', visibility: 'shared', id: 's1' }),
      log({ hour: 12, userId: 'me', visibility: 'private', id: 'p1' }),
      log({ hour: 19, userId: 'citra', visibility: 'shared', id: 's2' }),
    ];
    const feed = buildFeedTimeline(logs);
    expect(feed.map((l) => l.id)).toEqual(['s2', 's1']);
  });

  it('keeps multiple shared logs from the same user as separate events', () => {
    const logs = [
      log({ hour: 7, userId: 'ayu', mood: 'senang', id: 'a1' }),
      log({ hour: 13, userId: 'ayu', mood: 'marah', id: 'a2' }),
    ];
    const feed = buildFeedTimeline(logs);
    expect(feed.map((l) => l.id)).toEqual(['a2', 'a1']);
  });
});

describe('latestSharedPerUser', () => {
  it('picks the most recent shared log per user, ignoring private', () => {
    const logs = [
      log({ hour: 7, userId: 'ayu', mood: 'senang', id: 'a1' }),
      log({ hour: 13, userId: 'ayu', mood: 'marah', id: 'a2' }),
      log({ hour: 20, userId: 'ayu', mood: 'tenang', visibility: 'private', id: 'a3' }),
      log({ hour: 9, userId: 'bima', mood: 'sedih', id: 'b1' }),
    ];
    const latest = latestSharedPerUser(logs);
    expect(latest.ayu.id).toBe('a2');
    expect(latest.bima.id).toBe('b1');
  });
});
