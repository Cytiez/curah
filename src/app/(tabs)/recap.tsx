import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '@/components/GlassTabBar';
import { LiquidGlass } from '@/features/recap/LiquidGlass';
import { useTodayBands } from '@/store/useMoodStore';
import { Chrome, Radius, Spacing, Typography } from '@/theme';

export default function RecapScreen() {
  const insets = useSafeAreaInsets();
  const bands = useTodayBands();
  const [replayKey, setReplayKey] = useState(0);

  const handleReplay = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReplayKey((k) => k + 1);
  }, []);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: TAB_BAR_HEIGHT + Spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gelas Hari Ini</Text>
        <Text style={styles.subtitle}>Begini isi gelas energimu dari pagi sampai malam.</Text>
      </View>

      <View style={styles.glassArea}>
        <LiquidGlass bands={bands} replayKey={replayKey} />
      </View>

      <Pressable onPress={handleReplay} style={styles.replayButton} accessibilityRole="button">
        <Text style={styles.replayLabel}>Lihat Ulang</Text>
      </Pressable>
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
  glassArea: {
    flex: 1,
    justifyContent: 'center',
  },
  replayButton: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Chrome.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Chrome.border,
    marginTop: Spacing.lg,
  },
  replayLabel: {
    ...Typography.body,
    color: Chrome.text,
    fontWeight: '600',
  },
});
