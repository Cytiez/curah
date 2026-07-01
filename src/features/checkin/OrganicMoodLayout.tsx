import { StyleSheet, View } from 'react-native';

import type { Mood } from '@/features/mood/types';
import { MoodBlob } from './MoodBlob';

/**
 * Design-space dimensions. Blobs are deliberately large and overlapping —
 * "seperti cat acak-acakan" (like messy scattered paint) rather than neat
 * evenly-sized tiles — so both the design space and per-blob sizes are
 * bigger than the original Figma reference. Positions are kept in this
 * space and converted to percentages so the layout scales to any screen
 * width while preserving the organic, non-grid, overlapping arrangement.
 */
const DESIGN_W = 400;
const DESIGN_H = 540;

interface BlobSpec {
  mood: Mood;
  x: number;
  y: number;
  size: number;
}

// Wireframe used "Excited"/"Lelah" placeholders; mapped here to the official
// token moods (Senang/Netral) per the approved plan. Sizes vary per blob for
// a scattered, spilled-paint feel rather than uniform tiles.
const LAYOUT: BlobSpec[] = [
  { mood: 'marah', x: 10, y: 10, size: 195 },
  { mood: 'senang', x: 195, y: 0, size: 185 },
  { mood: 'cemas', x: 80, y: 150, size: 225 },
  { mood: 'netral', x: 230, y: 190, size: 175 },
  { mood: 'tenang', x: 0, y: 300, size: 200 },
  { mood: 'sedih', x: 190, y: 320, size: 210 },
];

export interface MoodTapInfo {
  mood: Mood;
  pageX: number;
  pageY: number;
  size: number;
}

interface OrganicMoodLayoutProps {
  onPickMood: (info: MoodTapInfo) => void;
}

export function OrganicMoodLayout({ onPickMood }: OrganicMoodLayoutProps) {
  return (
    <View style={styles.container}>
      {LAYOUT.map((spec, index) => (
        <MoodBlob
          key={spec.mood}
          mood={spec.mood}
          x={spec.x}
          y={spec.y}
          size={spec.size}
          designWidth={DESIGN_W}
          designHeight={DESIGN_H}
          index={index}
          onPress={(mood, layout) =>
            onPickMood({ mood, pageX: layout.pageX, pageY: layout.pageY, size: layout.size })
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    aspectRatio: DESIGN_W / DESIGN_H,
  },
});
