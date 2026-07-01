import { useEffect } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { MOOD_LABEL, type Mood } from '@/features/mood/types';
import { MOOD_COLORS } from '@/theme';
import { LiquidBlobLazy } from './LiquidBlobLazy';

interface MoodBlobProps {
  mood: Mood;
  /** Design-space position/size (see OrganicMoodLayout's DESIGN_W/DESIGN_H).
   * Changes (e.g. the per-focus jitter) animate smoothly rather than snapping. */
  x: number;
  y: number;
  size: number;
  designWidth: number;
  designHeight: number;
  /** Stagger index/seed so blobs don't wobble or drift in lockstep. */
  index: number;
  onPress: (mood: Mood, layout: { pageX: number; pageY: number; size: number }) => void;
}

/**
 * A single color-only mood tile, rendered as a continuously-morphing organic
 * liquid shape (see LiquidBlob) rather than a static circle. The wrapper
 * only adds a slow, subtle overall drift on top of that internal wobble —
 * a little movement in place, not a shift away from the tile's home
 * position. Tap fires a light haptic (handled by the caller) and reports
 * the blob's on-screen location so the paint-spill overlay can originate
 * there.
 */
export function MoodBlob({
  mood,
  x,
  y,
  size,
  designWidth,
  designHeight,
  index,
  onPress,
}: MoodBlobProps) {
  const drift = useSharedValue(0);
  const pressed = useSharedValue(0);
  const posX = useSharedValue(x);
  const posY = useSharedValue(y);

  useEffect(() => {
    const duration = 3400 + index * 300;
    drift.value = withDelay(
      index * 220,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    posX.value = withSpring(x, { damping: 16, stiffness: 90, mass: 1 });
    posY.value = withSpring(y, { damping: 16, stiffness: 90, mass: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);

  const animatedStyle = useAnimatedStyle(() => {
    const pressScale = interpolate(pressed.value, [0, 1], [1, 0.94]);
    const translateY = interpolate(drift.value, [0, 1], [0, -4]);
    const translateX = interpolate(drift.value, [0, 1], [0, index % 2 === 0 ? 3 : -3]);
    return {
      transform: [{ translateX }, { translateY }, { scale: pressScale }],
    };
  });

  const wrapperStyle = useAnimatedStyle(() => ({
    left: `${(posX.value / designWidth) * 100}%`,
    top: `${(posY.value / designHeight) * 100}%`,
  }));

  return (
    <Animated.View
      style={[styles.wrapper, { width: `${(size / designWidth) * 100}%` }, wrapperStyle]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={MOOD_LABEL[mood]}
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 120 });
        }}
        onPressOut={() => {
          pressed.value = withTiming(0, { duration: 200 });
        }}
        onPress={(e: GestureResponderEvent) => {
          const { pageX, pageY } = e.nativeEvent;
          onPress(mood, { pageX, pageY, size });
        }}
        style={styles.pressable}
      >
        <Animated.View style={[styles.blob, animatedStyle]}>
          <LiquidBlobLazy color={MOOD_COLORS[mood].base} seed={index * 1.7} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    aspectRatio: 1,
  },
  pressable: {
    flex: 1,
  },
  blob: {
    flex: 1,
  },
});
