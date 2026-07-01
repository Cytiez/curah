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
  withTiming,
} from 'react-native-reanimated';

import { MOOD_COLORS } from '@/theme';
import { MOOD_LABEL, type Mood } from '@/features/mood/types';

interface MoodBlobProps {
  mood: Mood;
  /** Design-space position/size (see OrganicMoodLayout's DESIGN_W/DESIGN_H). */
  x: number;
  y: number;
  size: number;
  designWidth: number;
  designHeight: number;
  /** Stagger index so blobs don't breathe in lockstep. */
  index: number;
  onPress: (mood: Mood, layout: { pageX: number; pageY: number; size: number }) => void;
}

/**
 * A single color-only mood tile. Breathes gently in place (scale + a few px
 * of drift) so the layout feels alive without shifting each tile's home
 * position. Tap fires a light haptic (handled by the caller) and reports the
 * blob's on-screen location so the paint-spill overlay can originate there.
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
  const breathe = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    const duration = 2800 + index * 260;
    breathe.value = withDelay(
      index * 180,
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

  const animatedStyle = useAnimatedStyle(() => {
    const breatheScale = interpolate(breathe.value, [0, 1], [1, 1.035]);
    const pressScale = interpolate(pressed.value, [0, 1], [1, 0.94]);
    const translateY = interpolate(breathe.value, [0, 1], [0, -3]);
    const translateX = interpolate(breathe.value, [0, 1], [0, index % 2 === 0 ? 2 : -2]);
    return {
      transform: [
        { translateX },
        { translateY },
        { scale: breatheScale * pressScale },
      ],
    };
  });

  return (
    <View
      style={[
        styles.wrapper,
        {
          left: `${(x / designWidth) * 100}%`,
          top: `${(y / designHeight) * 100}%`,
          width: `${(size / designWidth) * 100}%`,
        },
      ]}
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
        <Animated.View
          style={[styles.blob, { backgroundColor: MOOD_COLORS[mood].base }, animatedStyle]}
        />
      </Pressable>
    </View>
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
    borderRadius: 9999,
  },
});
