import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '@/components/GlassTabBar';
import { FeedTimeline } from '@/features/feed/FeedTimeline';
import { Chrome, Spacing, Typography } from '@/theme';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: TAB_BAR_HEIGHT + Spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Circle</Text>
        <Text style={styles.subtitle}>Mood terbaru dari circle kamu, seiring waktu.</Text>
      </View>
      <FeedTimeline />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Chrome.background,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.title,
    color: Chrome.text,
  },
  subtitle: {
    ...Typography.body,
    color: Chrome.textSecondary,
  },
});
