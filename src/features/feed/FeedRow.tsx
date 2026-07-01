import { StyleSheet, Text, View } from 'react-native';

import type { MoodLog } from '@/features/mood/types';
import { Chrome, Spacing, Typography } from '@/theme';
import { Avatar } from './Avatar';

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

/** One check-in event: avatar+mood ring, name, and time. No caption, no counts. */
export function FeedRow({ log, name }: FeedRowProps) {
  return (
    <View style={styles.row}>
      <Avatar name={name} mood={log.mood} />
      <View style={styles.meta}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.time}>{formatTime(log.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  meta: {
    gap: 2,
  },
  name: {
    ...Typography.body,
    color: Chrome.text,
    fontWeight: '600',
  },
  time: {
    ...Typography.caption,
    color: Chrome.textMuted,
  },
});
