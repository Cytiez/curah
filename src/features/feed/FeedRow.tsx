import { StyleSheet, View } from 'react-native';

import { MOOD_LABEL, type MoodLog } from '@/features/mood/types';
import { Spacing } from '@/theme';
import { Avatar } from './Avatar';
import { MoodBar } from './MoodBar';

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

interface FeedRowProps {
  log: MoodLog;
  name: string;
}

/**
 * One check-in event: only a profile picture and a mood-color bar — no
 * name, no time, no caption, no counts (per brief: "hanya foto profil dan
 * warnanya aja"). Order in the list still carries the timeline meaning; an
 * accessibilityLabel keeps who/what/when available to screen readers even
 * though nothing is shown visually.
 */
export function FeedRow({ log, name }: FeedRowProps) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${name}, ${MOOD_LABEL[log.mood]}, ${formatTime(log.createdAt)}`}
    >
      <Avatar name={name} />
      <MoodBar mood={log.mood} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
