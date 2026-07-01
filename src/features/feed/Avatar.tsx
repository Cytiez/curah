import { StyleSheet, Text, View } from 'react-native';

import type { Mood } from '@/features/mood/types';
import { Chrome, MOOD_COLORS } from '@/theme';

const SIZE = 48;
const RING_WIDTH = 3;

interface AvatarProps {
  name: string;
  mood: Mood;
}

/**
 * Profile placeholder (initials on a neutral fill) wrapped in a colored ring
 * for the tapped mood. Per the brief, the feed shows only "the profile photo
 * and the color" — no mood name/icon, so the ring IS the mood signal.
 */
export function Avatar({ name, mood }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <View style={[styles.ring, { borderColor: MOOD_COLORS[mood].base }]}>
      <View style={styles.fill}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: RING_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    width: SIZE - RING_WIDTH * 2 - 2,
    height: SIZE - RING_WIDTH * 2 - 2,
    borderRadius: (SIZE - RING_WIDTH * 2 - 2) / 2,
    backgroundColor: Chrome.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: Chrome.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
