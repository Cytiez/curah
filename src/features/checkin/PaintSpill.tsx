import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Easing, runOnJS, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RAISED_GAP, RAISED_SIZE, TAB_BAR_HEIGHT } from '@/components/GlassTabBar';
import { useMoodStore } from '@/store/useMoodStore';
import { MOOD_COLORS, Spacing } from '@/theme';
import { PourStreamLazy } from './PourStreamLazy';
import { SPILL_TRAVEL_MS } from './spillTiming';

const DRAIN_MS = 260;

/**
 * A continuous liquid stream — not a single traveling drop — pours from the
 * tapped mood's on-screen position down to the navbar along a sagging arc
 * (gravity-poured, not thrown). It extends progressively over SPILL_TRAVEL_MS
 * (matching the navbar's own fill animation, see GlassTabBar, so the pour
 * finishes exactly as the bar finishes filling), then drains away
 * trailing-first rather than cutting off abruptly. No fullscreen cover phase.
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
  // 0..2 timeline: 0->1 the stream pours/extends, 1->2 it drains away.
  const progress = useSharedValue(0);

  const targetX = width / 2;
  const targetY =
    height - insets.bottom - Spacing.sm - TAB_BAR_HEIGHT - RAISED_GAP - RAISED_SIZE / 2;

  useEffect(() => {
    if (!spillRequest || spillRequest.id === lastHandledId.current) return;
    lastHandledId.current = spillRequest.id;

    setAnchor({
      originX: spillRequest.originX,
      originY: spillRequest.originY,
      color: MOOD_COLORS[spillRequest.mood].base,
    });

    progress.value = 0;
    progress.value = withSequence(
      withTiming(1, { duration: SPILL_TRAVEL_MS, easing: Easing.out(Easing.cubic) }),
      withTiming(2, { duration: DRAIN_MS, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(clearSpillRequest)();
      }),
    );

    // Defensive JS-side fallback: guarantees spillRequest is cleared even if
    // the UI-thread completion callback above never fires, so the store
    // never gets stuck holding a stale request.
    const timeout = setTimeout(() => clearSpillRequest(), SPILL_TRAVEL_MS + DRAIN_MS + 150);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spillRequest]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <PourStreamLazy
        originX={anchor.originX}
        originY={anchor.originY}
        targetX={targetX}
        targetY={targetY}
        color={anchor.color}
        progress={progress}
      />
    </View>
  );
}
