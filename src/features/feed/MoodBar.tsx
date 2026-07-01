import { StyleSheet, View } from 'react-native';

import type { Mood } from '@/features/mood/types';
import { MOOD_COLORS, Radius } from '@/theme';

interface MoodBarProps {
  mood: Mood;
}

/** Solid-color rounded bar carrying the mood signal — no stroke, no icon. */
export function MoodBar({ mood }: MoodBarProps) {
  return <View style={[styles.bar, { backgroundColor: MOOD_COLORS[mood].base }]} />;
}

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    height: 40,
    borderRadius: Radius.sm,
  },
});
