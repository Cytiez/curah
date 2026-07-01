import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { buildFeedTimeline, stratifyDayLogs } from '@/features/mood/aggregation';
import { makeMockLogs } from '@/features/mood/mockData';
import type { Mood, MoodLog, Visibility } from '@/features/mood/types';

export interface SpillRequest {
  id: number;
  mood: Mood;
  originX: number;
  originY: number;
}

interface MoodState {
  logs: MoodLog[];
  /** Mood of the most recent log (any visibility). Drives the navbar tint. */
  currentMood: Mood | null;
  /** Sticky sharing choice for the next log; anti-dark-pattern default is private. */
  sharingDefault: Visibility;
  /** Ephemeral trigger for the paint-spill overlay; cleared once it finishes playing. */
  spillRequest: SpillRequest | null;
  addLog: (mood: Mood, origin: { x: number; y: number }) => void;
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
      spillRequest: { id: idCounter, mood, originX: origin.x, originY: origin.y },
    }));
  },
  clearSpillRequest: () => set({ spillRequest: null }),
  setSharingDefault: (visibility) => set({ sharingDefault: visibility }),
}));

const selectTodayBands = (state: MoodState) => stratifyDayLogs(state.logs);
const selectFeedTimeline = (state: MoodState) => buildFeedTimeline(state.logs);

// These selectors derive a NEW array on every call. Zustand compares
// selector results by reference by default, so calling them directly would
// re-render (and thus re-derive) on every store update, forever. useShallow
// makes the comparison element-wise instead, so exposing them only as hooks
// keeps that footgun out of consuming components.
export const useTodayBands = () => useMoodStore(useShallow(selectTodayBands));
export const useFeedTimeline = () => useMoodStore(useShallow(selectFeedTimeline));
