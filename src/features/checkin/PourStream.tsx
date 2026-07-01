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

import { buildHeadCapPath, buildLiquidStreamPath } from './pourPath';

const SAG = 70;

interface PourStreamProps {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  /** Diameter (px) of the tapped blob — the stream is drawn this wide. */
  streamWidth: number;
  color: string;
  /** 0..2 timeline: 0→1 the stream extends (pours), 1→2 it drains away trailing-first. */
  progress: SharedValue<number>;
}

/**
 * A continuously-extending liquid stream (not a single traveling drop) from
 * the tapped mood's position to the navbar — "cat tumpah terus menerus"
 * (paint spilling continuously) rather than one blob making a single trip.
 * Drawn as a filled, tapered, wobbly ribbon (see pourPath.ts) with a rounded
 * droplet cap at the leading edge, instead of a uniform-width stroke, which
 * read as a felt-tip marker line rather than liquid. Its width matches the
 * tapped blob's own size.
 */
export function PourStream({
  originX,
  originY,
  targetX,
  targetY,
  streamWidth,
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
      streamWidth,
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
      streamWidth,
      wobblePhase.value,
    );
  });

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Path path={path} color={color} />
      <Path path={headCap} color={color} />
    </Canvas>
  );
}
