import { useMemo } from 'react';
import { create } from 'zustand';

import { buildFeedTimeline, moodCountsForToday } from '@/features/mood/aggregation';
import { makeMockLogs } from '@/features/mood/mockData';
import type { Mood, MoodLog, Visibility } from '@/features/mood/types';

export interface SpillRequest {
  id: number;
  mood: Mood;
  originX: number;
  originY: number;
  /** Diameter (px) of the tapped blob, so the pour stream can match its width. */
  originSize: number;
}

interface MoodState {
  logs: MoodLog[];
  /** Mood of the most recent log (any visibility). Drives the navbar tint. */
  currentMood: Mood | null;
  /** Sticky sharing choice for the next log; anti-dark-pattern default is private. */
  sharingDefault: Visibility;
  /** Ephemeral trigger for the paint-spill overlay; cleared once it finishes playing. */
  spillRequest: SpillRequest | null;
  addLog: (mood: Mood, origin: { x: number; y: number; size: number }) => void;
  clearSpillRequest: () => void;
  setSharingDefault: (visibility: Visibility) => void;
}

let idCounter = 0;

export const useMoodStore = create<MoodState>((set, get) => ({
  logs: makeMockLogs(),
  currentMood: null,
  sharingDefault: 'private',
  spillRequest: null,
  addLog: (mood, origin) => {
    const log: MoodLog = {
      id: `local-${Date.now()}-${idCounter++}`,
      userId: 'me',
      mood,
      visibility: get().sharingDefault,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      logs: [...state.logs, log],
      currentMood: mood,
      spillRequest: {
        id: idCounter,
        mood,
        originX: origin.x,
        originY: origin.y,
        originSize: origin.size,
      },
    }));
  },
  clearSpillRequest: () => set({ spillRequest: null }),
  setSharingDefault: (visibility) => set({ sharingDefault: visibility }),
}));

const selectLogs = (state: MoodState) => state.logs;

// moodCountsForToday/buildFeedTimeline build fresh wrapper objects on every
// call, so even a shallow-compared Zustand selector would see "new" output
// every render and loop forever. Deriving them in useMemo, keyed off the
// store's raw `logs` reference (which zustand only ever changes on a real
// addLog), avoids that: recomputation only happens when logs actually change.
export const useMoodShares = () => {
  const logs = useMoodStore(selectLogs);
  return useMemo(() => moodCountsForToday(logs), [logs]);
};

export const useFeedTimeline = () => {
  const logs = useMoodStore(selectLogs);
  return useMemo(() => buildFeedTimeline(logs), [logs]);
};
