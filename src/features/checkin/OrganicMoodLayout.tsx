import { StyleSheet, View } from 'react-native';

import type { Mood } from '@/features/mood/types';
import { MoodBlob } from './MoodBlob';

/**
 * Design-space dimensions, taken from the Figma wireframe's "Organic Mood
 * Layout" container (Page 4, node 18:72: 340x380 px holding six 120x120
 * tiles). Positions are kept in this space and converted to percentages so
 * the layout scales to any screen width while preserving the organic,
 * non-grid arrangement.
 */
const DESIGN_W = 340;
const DESIGN_H = 380;
const BLOB_SIZE = 120;

interface BlobSpec {
  mood: Mood;
  x: number;
  y: number;
}

// Wireframe used "Excited"/"Lelah" placeholders; mapped here to the official
// token moods (Senang/Netral) per the approved plan.
const LAYOUT: BlobSpec[] = [
  { mood: 'marah', x: 20, y: 10 },
  { mood: 'senang', x: 210, y: 0 },
  { mood: 'netral', x: 220, y: 140 },
  { mood: 'cemas', x: 110, y: 130 },
  { mood: 'tenang', x: 10, y: 250 },
  { mood: 'sedih', x: 210, y: 240 },
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
          size={BLOB_SIZE}
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
    maxWidth: 380,
    aspectRatio: DESIGN_W / DESIGN_H,
  },
});
