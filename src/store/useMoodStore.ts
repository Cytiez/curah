import { create } from 'zustand';

import { buildFeedTimeline, stratifyDayLogs } from '@/features/mood/aggregation';
import { makeMockLogs } from '@/features/mood/mockData';
import type { Mood, MoodLog, Visibility } from '@/features/mood/types';

interface MoodState {
  logs: MoodLog[];
  /** Mood of the most recent log (any visibility). Drives the navbar tint. */
  currentMood: Mood | null;
  /** Sticky sharing choice for the next log; anti-dark-pattern default is private. */
  sharingDefault: Visibility;
  addLog: (mood: Mood) => void;
  setSharingDefault: (visibility: Visibility) => void;
}

let idCounter = 0;

export const useMoodStore = create<MoodState>((set, get) => ({
  logs: makeMockLogs(),
  currentMood: null,
  sharingDefault: 'private',
  addLog: (mood) => {
    const log: MoodLog = {
      id: `local-${Date.now()}-${idCounter++}`,
      userId: 'me',
      mood,
      visibility: get().sharingDefault,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ logs: [...state.logs, log], currentMood: mood }));
  },
  setSharingDefault: (visibility) => set({ sharingDefault: visibility }),
}));

export const selectTodayBands = (state: MoodState) => stratifyDayLogs(state.logs);
export const selectFeedTimeline = (state: MoodState) => buildFeedTimeline(state.logs);
