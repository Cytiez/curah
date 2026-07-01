import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '@/components/GlassTabBar';
import { useMoodStore } from '@/store/useMoodStore';
import { MOOD_COLORS, Spacing } from '@/theme';
import { SPILL_TRAVEL_MS } from './spillTiming';

const DROP_SIZE = 34;
/** How much the arc sags below a straight line, for a gravity-poured feel. */
const ARC_SAG = 90;

/**
 * A small liquid drop travels from the tapped mood's on-screen position down
 * to the navbar along a sagging arc (like something poured, not thrown),
 * shrinking and fading as it arrives — no fullscreen cover phase. The
 * navbar's own fill-wipe animation (see GlassTabBar) is driven by the same
 * spillRequest and SPILL_TRAVEL_MS, so the two stay in sync: the drop
 * visually lands right as the bar finishes filling with the new color.
 *
 * NOTE: `experiments.reactCompiler` is disabled in app.json. With it on, a
 * multi-stage `withSequence` on this timeline never advanced past the first
 * stage (the completion callback silently never fired) — verified by
 * isolating down to a single `withTiming` call. Re-enabling the compiler
 * will reintroduce that regression for any similarly chained sequence.
 */
export function PaintSpillOverlay() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const spillRequest = useMoodStore((s) => s.spillRequest);
  const clearSpillRequest = useMoodStore((s) => s.clearSpillRequest);
  const lastHandledId = useRef<number | null>(null);

  const [anchor, setAnchor] = useState({
    originX: 0,
    originY: 0,
    color: MOOD_COLORS.netral.base,
  });
  const progress = useSharedValue(0);

  const navbarX = width / 2;
  const navbarY = height - insets.bottom - Spacing.sm - TAB_BAR_HEIGHT / 2;

  useEffect(() => {
    if (!spillRequest || spillRequest.id === lastHandledId.current) return;
    lastHandledId.current = spillRequest.id;

    setAnchor({
      originX: spillRequest.originX,
      originY: spillRequest.originY,
      color: MOOD_COLORS[spillRequest.mood].base,
    });

    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: SPILL_TRAVEL_MS, easing: Easing.in(Easing.quad) },
      (done) => {
        if (done) runOnJS(clearSpillRequest)();
      },
    );

    // Defensive JS-side fallback: guarantees spillRequest is cleared even if
    // the UI-thread completion callback above never fires, so the store
    // never gets stuck holding a stale request.
    const timeout = setTimeout(() => clearSpillRequest(), SPILL_TRAVEL_MS + 150);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spillRequest]);

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    // Quadratic bezier: origin -> sagging control point -> navbar target.
    const controlX = (anchor.originX + navbarX) / 2;
    const controlY = (anchor.originY + navbarY) / 2 + ARC_SAG;
    const cx =
      (1 - t) * (1 - t) * anchor.originX + 2 * (1 - t) * t * controlX + t * t * navbarX;
    const cy =
      (1 - t) * (1 - t) * anchor.originY + 2 * (1 - t) * t * controlY + t * t * navbarY;

    const scale = interpolate(t, [0, 0.7, 1], [1, 0.8, 0.35], Extrapolation.CLAMP);
    const opacity = interpolate(t, [0, 0.8, 1], [1, 1, 0], Extrapolation.CLAMP);

    return {
      left: cx - DROP_SIZE / 2,
      top: cy - DROP_SIZE / 2,
      backgroundColor: anchor.color,
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.drop, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  drop: {
    position: 'absolute',
    width: DROP_SIZE,
    height: DROP_SIZE,
    borderRadius: DROP_SIZE / 2,
  },
});
