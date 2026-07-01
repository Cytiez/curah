import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { Visibility } from '@/features/mood/types';
import { Chrome, Radius, Spacing, Typography } from '@/theme';

const TRACK_PADDING = 4;

interface SharingToggleProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
}

/**
 * Pribadi/Circle segmented toggle. Sets the visibility that the NEXT log
 * will use (default is "private", per the anti-dark-pattern principle: never
 * default to broadcasting). A sliding pill (not an instant style swap) tracks
 * the active option.
 */
export function SharingToggle({ value, onChange }: SharingToggleProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const thumbX = useSharedValue(0);
  const optionWidth = trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / 2 : 0;

  useEffect(() => {
    if (trackWidth === 0) return;
    const target = value === 'private' ? 0 : optionWidth;
    thumbX.value = withSpring(target, { damping: 18, stiffness: 220, mass: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, trackWidth]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const onTrackLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>Privasi Log</Text>
      <View style={styles.track} onLayout={onTrackLayout}>
        {optionWidth > 0 && (
          <Animated.View style={[styles.thumb, { width: optionWidth }, thumbStyle]} />
        )}
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
      style={styles.option}
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
    padding: TRACK_PADDING,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Chrome.border,
  },
  thumb: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: TRACK_PADDING,
    borderRadius: Radius.pill,
    backgroundColor: Chrome.surface,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    alignItems: 'center',
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
