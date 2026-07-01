import { FlatList, StyleSheet, Text, View } from 'react-native';

import { USERS_BY_ID } from '@/features/mood/mockData';
import type { MoodLog } from '@/features/mood/types';
import { useFeedTimeline } from '@/store/useMoodStore';
import { Chrome, Spacing, Typography } from '@/theme';
import { FeedRow } from './FeedRow';

/**
 * Chronological, X-style timeline of shared circle check-ins (newest first).
 * A plain FlatList over a small, already-loaded array — no pagination, no
 * infinite scroll, per the MVP's anti-engagement-feed principle.
 */
export function FeedTimeline() {
  const timeline = useFeedTimeline();

  if (timeline.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Belum ada yang check-in hari ini.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={timeline}
      keyExtractor={(log) => log.id}
      renderItem={({ item }: { item: MoodLog }) => (
        <FeedRow log={item} name={USERS_BY_ID[item.userId]?.name ?? 'Circle'} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Chrome.border,
  },
  empty: {
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Chrome.textMuted,
  },
});
