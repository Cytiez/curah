import { Canvas, Group, Path, type SkSize } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { MOODS, type Mood } from '@/features/mood/types';
import { MOOD_COLORS } from '@/theme';
import { buildGlassPath, buildLiquidLayerPath } from './glassPath';

interface RecapGlassProps {
  shares: Record<Mood, number>;
  /** Bump to replay the pour-in settle animation. */
  replayKey: number;
}

const STAGGER_MS = 130;

/**
 * "Gelas Hari Ini" as an actual glass silhouette (Skia clip) containing one
 * solid-color liquid layer per mood, stacked by the fixed MOODS order with
 * gently wavy (not flat, not blended) boundaries. Height is proportional to
 * how much of today that mood accounted for. Moods with zero logs simply
 * contribute no height — the glass shows proportion, not a timeline.
 */
export function RecapGlass({ shares, replayKey }: RecapGlassProps) {
  const size = useSharedValue<SkSize>({ width: 0, height: 0 });
  const wavePhase = useSharedValue(0);

  // One shared value per mood, unrolled explicitly (not in a loop) so every
  // useSharedValue/useDerivedValue call site below stays lint-clean.
  const pSenang = useSharedValue(0);
  const pTenang = useSharedValue(0);
  const pNetral = useSharedValue(0);
  const pSedih = useSharedValue(0);
  const pMarah = useSharedValue(0);
  const pCemas = useSharedValue(0);
  const progressByMood: Record<Mood, ReturnType<typeof useSharedValue<number>>> = {
    senang: pSenang,
    tenang: pTenang,
    netral: pNetral,
    sedih: pSedih,
    marah: pMarah,
    cemas: pCemas,
  };
  // MOODS has a fixed, compile-time-constant length (six moods, never
  // changes at runtime), so mapping it into hook calls below always
  // produces the same number of calls in the same order every render.
  const progresses = MOODS.map((mood) => progressByMood[mood]);

  useEffect(() => {
    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 4600, easing: Easing.linear }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    MOODS.forEach((mood, index) => {
      progressByMood[mood].value = 0;
      progressByMood[mood].value = withDelay(
        index * STAGGER_MS,
        withSpring(1, { damping: 12, stiffness: 120, mass: 0.8 }),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey]);

  const total = MOODS.reduce((sum, mood) => sum + shares[mood], 0);
  const shareRatios = MOODS.map((mood) => (total > 0 ? shares[mood] / total : 0));

  const glassPath = useDerivedValue(() => buildGlassPath(size.value.width, size.value.height));

  const layerPaths = MOODS.map((_, index) =>
    useDerivedValue(() => {
      const w = size.value.width;
      const h = size.value.height;
      let bottomAcc = 0;
      for (let j = 0; j < index; j++) {
        bottomAcc += shareRatios[j] * h * progresses[j].value;
      }
      const myHeight = shareRatios[index] * h * progresses[index].value;
      const bottomY = h - bottomAcc;
      const topY = bottomY - myHeight;
      return buildLiquidLayerPath(w, topY, bottomY, wavePhase.value);
    }),
  );

  return (
    <Canvas style={StyleSheet.absoluteFill} onSize={size}>
      <Group clip={glassPath}>
        {MOODS.map((mood, index) => (
          <Path key={mood} path={layerPaths[index]} color={MOOD_COLORS[mood].base} />
        ))}
      </Group>
      <Path path={glassPath} style="stroke" strokeWidth={2} color="rgba(255,255,255,0.16)" />
    </Canvas>
  );
}
