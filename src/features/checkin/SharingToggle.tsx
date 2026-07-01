import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Visibility } from '@/features/mood/types';
import { Chrome, Radius, Spacing, Typography } from '@/theme';

interface SharingToggleProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
}

/**
 * Pribadi/Circle segmented toggle. Sets the visibility that the NEXT log
 * will use (default is "private", per the anti-dark-pattern principle: never
 * default to broadcasting).
 */
export function SharingToggle({ value, onChange }: SharingToggleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.caption}>Privasi Log</Text>
      <View style={styles.track}>
        <Option
          label="Pribadi"
          accessibilityLabel="Simpan sebagai log pribadi"
          active={value === 'private'}
          onPress={() => onChange('private')}
        />
        <Option
          label="Circle"
          accessibilityLabel="Bagikan ke circle"
          active={value === 'shared'}
          onPress={() => onChange('shared')}
        />
      </View>
    </View>
  );
}

function Option({
  label,
  accessibilityLabel,
  active,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      style={[styles.option, active && styles.optionActive]}
    >
      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  caption: {
    ...Typography.label,
    color: Chrome.textMuted,
    textAlign: 'center',
  },
  track: {
    flexDirection: 'row',
    backgroundColor: Chrome.surfaceElevated,
    borderRadius: Radius.pill,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Chrome.border,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: Chrome.surface,
  },
  optionLabel: {
    ...Typography.body,
    fontSize: 14,
    color: Chrome.textMuted,
  },
  optionLabelActive: {
    color: Chrome.text,
    fontWeight: '600',
  },
});
