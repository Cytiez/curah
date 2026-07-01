import { StyleSheet, Text, View } from 'react-native';

import type { GlassBand as GlassBandData } from '@/features/mood/aggregation';
import { Chrome, Radius, Spacing, Typography } from '@/theme';
import { GlassBand } from './GlassBand';

const STAGGER_MS = 140;

interface LiquidGlassProps {
  bands: GlassBandData[];
  replayKey: number;
}

/**
 * "Gelas Hari Ini": today's mood logs as discrete, stratified color bands
 * (never blended). `bands` is newest-first (top of the glass); the settle
 * animation staggers bottom-up so it reads like liquid poured through the
 * day, oldest log first.
 */
export function LiquidGlass({ bands, replayKey }: LiquidGlassProps) {
  if (bands.length === 0) {
    return (
      <View style={[styles.glass, styles.empty]}>
        <Text style={styles.emptyText}>Belum ada log hari ini.</Text>
      </View>
    );
  }

  return (
    <View style={styles.glass}>
      <View style={styles.highlight} pointerEvents="none" />
      <View style={styles.bandStack}>
        {bands.map((band, index) => (
          <GlassBand
            key={band.log.id}
            mood={band.log.mood}
            period={band.period}
            replayKey={replayKey}
            delayMs={(bands.length - 1 - index) * STAGGER_MS}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    aspectRatio: 320 / 400,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Chrome.borderStrong,
    overflow: 'hidden',
    backgroundColor: Chrome.surface,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  bandStack: {
    flex: 1,
    padding: 6,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  emptyText: {
    ...Typography.body,
    color: Chrome.textMuted,
    textAlign: 'center',
  },
});
