import { Canvas, Path } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { buildPourArcPath } from './pourPath';

const SAG = 70;
const STREAM_WIDTH = 22;

interface PourStreamProps {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  color: string;
  /** 0..2 timeline: 0→1 the stream extends (pours), 1→2 it drains away trailing-first. */
  progress: SharedValue<number>;
}

/**
 * A continuously-extending liquid stream (not a single traveling drop) from
 * the tapped mood's position to the navbar, using Skia's path trim (start/
 * end) to reveal it progressively — "cat tumpah terus menerus" (paint
 * spilling continuously) rather than one blob making a single trip.
 */
export function PourStream({ originX, originY, targetX, targetY, color, progress }: PourStreamProps) {
  const path = useDerivedValue(() => buildPourArcPath(originX, originY, targetX, targetY, SAG));
  const start = useDerivedValue(() => Math.max(0, progress.value - 1));
  const end = useDerivedValue(() => Math.min(1, progress.value));

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Path
        path={path}
        style="stroke"
        strokeWidth={STREAM_WIDTH}
        strokeCap="round"
        color={color}
        start={start}
        end={end}
      />
    </Canvas>
  );
}
