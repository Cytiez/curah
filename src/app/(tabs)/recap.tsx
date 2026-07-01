import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NAVBAR_CLEARANCE } from '@/components/GlassTabBar';
import { RecapGlassLazy } from '@/features/recap/RecapGlassLazy';
import { useMoodShares } from '@/store/useMoodStore';
import { Chrome, Spacing, Typography } from '@/theme';

export default function RecapScreen() {
  const insets = useSafeAreaInsets();
  const shares = useMoodShares();
  const [replayKey, setReplayKey] = useState(0);

  // Replays the settle animation every time this tab gains focus (including
  // the first time), not just once on mount — no manual "Lihat Ulang" needed.
  useFocusEffect(
    useCallback(() => {
      setReplayKey((k) => k + 1);
    }, []),
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.lg, paddingBottom: NAVBAR_CLEARANCE + Spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gelas Hari Ini</Text>
        <Text style={styles.subtitle}>Begini isi gelas energimu dari pagi sampai malam.</Text>
      </View>

      <View style={styles.glassArea}>
        <View style={styles.glassBox}>
          <RecapGlassLazy shares={shares} replayKey={replayKey} />
        </View>
      </View>
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
    alignItems: 'center',
  },
  glassBox: {
    width: '82%',
    maxWidth: 300,
    aspectRatio: 0.72,
  },
});
