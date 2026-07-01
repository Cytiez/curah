import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '@/components/GlassTabBar';
import { useMoodStore } from '@/store/useMoodStore';
import { MOOD_COLORS, Spacing } from '@/theme';

const BLOB_SIZE = 120;
const GROW_MS = 300;
const HOLD_MS = 90;
const FUNNEL_MS = 480;
const FADE_MS = 200;

// Phase markers along a single 0..3 progress timeline: start -> fully grown
// (covers the page) -> funneled into the navbar's position -> faded out.
const P_START = 0;
const P_GROWN = 1;
const P_FUNNELED = 2;
const P_FADED = 3;

/**
 * Full-screen "paint spill" overlay, mounted once at the app root so it
 * paints above the tab bar. A circle grows from the tapped blob's screen
 * position to cover the whole page, holds briefly, then funnels down and
 * shrinks into the tab bar's position before fading —
 * visually "pouring" the mood color into the glass navbar, which has
 * already started cross-fading to that color underneath.
 *
 * NOTE: `experiments.reactCompiler` is disabled in app.json. With it on,
 * this multi-stage `withSequence` never advances past the first stage (the
 * completion callback silently never fires) — verified by isolating down to
 * a single `withTiming` call. Re-enabling the compiler will reintroduce that
 * regression for any similarly chained Reanimated sequence.
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
  const progress = useSharedValue(P_START);

  const navbarX = width / 2;
  const navbarY = height - insets.bottom - Spacing.sm - TAB_BAR_HEIGHT / 2;
  const diagonal = Math.sqrt(width * width + height * height);
  const coverScale = (diagonal * 2.2) / BLOB_SIZE;

  useEffect(() => {
    if (!spillRequest || spillRequest.id === lastHandledId.current) return;
    lastHandledId.current = spillRequest.id;

    setAnchor({
      originX: spillRequest.originX,
      originY: spillRequest.originY,
      color: MOOD_COLORS[spillRequest.mood].base,
    });

    progress.value = P_START;
    progress.value = withSequence(
      withTiming(P_GROWN, { duration: GROW_MS, easing: Easing.out(Easing.cubic) }),
      withTiming(P_GROWN, { duration: HOLD_MS }),
      withTiming(P_FUNNELED, { duration: FUNNEL_MS, easing: Easing.in(Easing.cubic) }),
      withTiming(P_FADED, { duration: FADE_MS }, (done) => {
        if (done) runOnJS(clearSpillRequest)();
      }),
    );

    // Defensive JS-side fallback: guarantees spillRequest is cleared even if
    // the UI-thread completion callback above never fires, so the store
    // never gets stuck holding a stale request.
    const totalMs = GROW_MS + HOLD_MS + FUNNEL_MS + FADE_MS + 150;
    const timeout = setTimeout(() => clearSpillRequest(), totalMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spillRequest]);

  const style = useAnimatedStyle(() => {
    const stops = [P_START, P_GROWN, P_FUNNELED, P_FADED];
    const scale = interpolate(
      progress.value,
      stops,
      [0, coverScale, 0.12, 0.12],
      Extrapolation.CLAMP,
    );
    const cx = interpolate(
      progress.value,
      stops,
      [anchor.originX, anchor.originX, navbarX, navbarX],
      Extrapolation.CLAMP,
    );
    const cy = interpolate(
      progress.value,
      stops,
      [anchor.originY, anchor.originY, navbarY, navbarY],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(progress.value, stops, [1, 1, 1, 0], Extrapolation.CLAMP);
    return {
      left: cx - BLOB_SIZE / 2,
      top: cy - BLOB_SIZE / 2,
      backgroundColor: anchor.color,
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.blob, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
  },
});
