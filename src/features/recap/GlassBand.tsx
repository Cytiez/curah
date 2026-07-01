import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import type { DayPeriod } from '@/features/mood/aggregation';
import { PERIOD_LABEL } from '@/features/mood/aggregation';
import { MOOD_LABEL, type Mood } from '@/features/mood/types';
import { Chrome, MOOD_COLORS, Typography } from '@/theme';

interface GlassBandProps {
  mood: Mood;
  period: DayPeriod;
  /** Bump this to replay the settle-in animation. */
  replayKey: number;
  /** Stagger delay (ms) so bands settle bottom-up, like liquid being poured through the day. */
  delayMs: number;
}

/** One discrete, solid-color band. Settles into place with a light spring bounce. */
export function GlassBand({ mood, period, replayKey, delayMs }: GlassBandProps) {
  const settle = useSharedValue(0);

  useEffect(() => {
    settle.value = 0;
    settle.value = withDelay(delayMs, withSpring(1, { damping: 11, stiffness: 140, mass: 0.7 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey, delayMs]);

  const style = useAnimatedStyle(() => ({
    opacity: settle.value,
    transform: [{ translateY: (1 - settle.value) * 24 }],
  }));

  return (
    <Animated.View style={[styles.band, { backgroundColor: MOOD_COLORS[mood].base }, style]}>
      <Text style={styles.label}>
        {PERIOD_LABEL[period]} · {MOOD_LABEL[mood]}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: {
    flex: 1,
    marginBottom: 3,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    ...Typography.caption,
    color: Chrome.background,
    fontWeight: '600',
    opacity: 0.7,
  },
});
