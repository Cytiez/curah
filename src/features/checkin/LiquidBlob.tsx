import { Canvas, Path, type SkSize } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { buildBlobPath } from './blobPath';

interface LiquidBlobProps {
  color: string;
  /** Distinct per-blob so identical shapes don't wobble in lockstep. */
  seed: number;
}

/**
 * Renders one continuously-morphing organic liquid shape filling its box.
 * `onSize` is a Skia-managed SharedValue updated automatically on layout, so
 * the path always matches the canvas's real rendered pixel size regardless
 * of the percentage-based sizing used by the parent layout.
 */
export function LiquidBlob({ color, seed }: LiquidBlobProps) {
  const t = useSharedValue(0);
  const size = useSharedValue<SkSize>({ width: 0, height: 0 });

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.linear }), -1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const path = useDerivedValue(() => {
    const box = Math.min(size.value.width, size.value.height);
    const center = box / 2;
    const radius = box * 0.42;
    return buildBlobPath(center, center, radius, t.value, seed);
  });

  return (
    <Canvas style={StyleSheet.absoluteFill} onSize={size}>
      <Path path={path} color={color} />
    </Canvas>
  );
}
