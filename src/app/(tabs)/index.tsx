import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NAVBAR_CLEARANCE } from '@/components/GlassTabBar';
import { OrganicMoodLayout, type MoodTapInfo } from '@/features/checkin/OrganicMoodLayout';
import { SharingToggle } from '@/features/checkin/SharingToggle';
import { useMoodStore } from '@/store/useMoodStore';
import { Chrome, Spacing, Typography } from '@/theme';

export default function CheckinScreen() {
  const insets = useSafeAreaInsets();
  const addLog = useMoodStore((s) => s.addLog);
  const sharingDefault = useMoodStore((s) => s.sharingDefault);
  const setSharingDefault = useMoodStore((s) => s.setSharingDefault);

  const handlePickMood = useCallback(
    (info: MoodTapInfo) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addLog(info.mood, { x: info.pageX, y: info.pageY, size: info.size });
    },
    [addLog],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: NAVBAR_CLEARANCE + Spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Apa kabarmu?</Text>
        <Text style={styles.subtitle}>Pilih satu yang paling menggambarkan perasaanmu saat ini.</Text>
      </View>

      <View style={styles.layoutArea}>
        <OrganicMoodLayout onPickMood={handlePickMood} />
      </View>

      <SharingToggle value={sharingDefault} onChange={setSharingDefault} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Chrome.background,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.title,
    color: Chrome.text,
  },
  subtitle: {
    ...Typography.body,
    color: Chrome.textSecondary,
  },
  layoutArea: {
    flex: 1,
    justifyContent: 'center',
  },
});
