import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { buildLiquidLayerPath } from '@/features/recap/glassPath';

interface LiquidFillProps {
  width: number;
  height: number;
  /** Corner radius of the container being filled (clamped to a stadium
   * shape when it exceeds half the height, same as RN's own borderRadius
   * clamping) — lets one component serve both the pill bar and the round
   * raised button. */
  borderRadius: number;
  color: string;
  opacity: number;
  /** 0..1, bottom-to-top fill amount. */
  progress: SharedValue<number>;
}

/**
 * The navbar's mood-tint fill, rendered as a real liquid surface (wavy top
 * edge, same technique as the Recap glass bands) instead of a flat
 * rectangle sliding up — a straight-edge wipe read as a mechanical UI
 * animation, not liquid. Clipped to the container's rounded-rect/circle
 * shape via a Skia Group so it never spills past the pill or button bounds.
 */
export function LiquidFill({ width, height, borderRadius, color, opacity, progress }: LiquidFillProps) {
  const wavePhase = useSharedValue(0);

  useEffect(() => {
    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 3400, easing: Easing.linear }),
      -1,
      false,
    );
  }, [wavePhase]);

  const clipPath = useDerivedValue(() => {
    const r = Math.min(borderRadius, height / 2, width / 2);
    const path = Skia.Path.Make();
    path.addRRect(Skia.RRectXY(Skia.XYWHRect(0, 0, width, height), r, r));
    return path;
  });

  const liquidPath = useDerivedValue(() => {
    // Once fully filled, lock to a plain solid rect instead of the wavy
    // path — the wave's crests/troughs oscillate above and below the
    // nominal top edge, and at progress 1 that trough dips below the
    // container's top, leaving a thin gap where the blurred background
    // peeked through even though the bar reads as "done".
    if (progress.value >= 0.999) {
      const path = Skia.Path.Make();
      path.addRect(Skia.XYWHRect(0, 0, width, height));
      return path;
    }
    const topY = height * (1 - progress.value);
    return buildLiquidLayerPath(width, topY, height, wavePhase.value);
  });

  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group clip={clipPath}>
        <Path path={liquidPath} color={color} opacity={opacity} />
      </Group>
    </Canvas>
  );
}
