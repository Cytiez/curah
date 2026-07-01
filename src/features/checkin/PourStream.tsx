import { Canvas, Path } from '@shopify/react-native-skia';
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

import { buildHeadCapPath, buildLiquidStreamPath, buildTailCapPath } from './pourPath';

const SAG = 70;

interface PourStreamProps {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  /** Diameter (px) of the tapped blob — the stream starts this wide. */
  originWidth: number;
  /** Diameter (px) of the navbar's raised button — the stream narrows to
   * this by the time it arrives, so it never floats wider than its target. */
  targetWidth: number;
  color: string;
  /** 0..2 timeline: 0→1 the stream extends (pours), 1→2 it drains away trailing-first. */
  progress: SharedValue<number>;
}

/**
 * A continuously-extending liquid stream (not a single traveling drop) from
 * the tapped mood's position to the navbar — "cat tumpah terus menerus"
 * (paint spilling continuously) rather than one blob making a single trip.
 * Drawn as a filled, wobbly ribbon (see pourPath.ts) that tapers from the
 * blob's own size down to the navbar button's size, with rounded droplet
 * caps at both ends, instead of a uniform-width stroke, which read as a
 * felt-tip marker line rather than liquid.
 */
export function PourStream({
  originX,
  originY,
  targetX,
  targetY,
  originWidth,
  targetWidth,
  color,
  progress,
}: PourStreamProps) {
  const wobblePhase = useSharedValue(0);

  useEffect(() => {
    wobblePhase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
  }, [wobblePhase]);

  const path = useDerivedValue(() => {
    const start = Math.max(0, progress.value - 1);
    const end = Math.min(1, progress.value);
    return buildLiquidStreamPath(
      originX,
      originY,
      targetX,
      targetY,
      SAG,
      start,
      end,
      originWidth,
      targetWidth,
      wobblePhase.value,
    );
  });

  const headCap = useDerivedValue(() => {
    const start = Math.max(0, progress.value - 1);
    const end = Math.min(1, progress.value);
    return buildHeadCapPath(
      originX,
      originY,
      targetX,
      targetY,
      SAG,
      start,
      end,
      originWidth,
      targetWidth,
      wobblePhase.value,
    );
  });

  const tailCap = useDerivedValue(() => {
    const start = Math.max(0, progress.value - 1);
    const end = Math.min(1, progress.value);
    return buildTailCapPath(
      originX,
      originY,
      targetX,
      targetY,
      SAG,
      start,
      end,
      originWidth,
      targetWidth,
      wobblePhase.value,
    );
  });

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Path path={path} color={color} />
      <Path path={headCap} color={color} />
      <Path path={tailCap} color={color} />
    </Canvas>
  );
}
