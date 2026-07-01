import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SPILL_TRAVEL_MS } from '@/features/checkin/spillTiming';
import { useMoodStore } from '@/store/useMoodStore';
import { Chrome, MOOD_COLORS, Radius, Spacing, Typography } from '@/theme';

export const TAB_BAR_HEIGHT = 64;
const NEUTRAL_TINT = Chrome.surfaceElevated;
const RAISED_SIZE = 68;
const RAISED_POKE = 40;

const TAB_LABEL: Record<string, string> = {
  index: 'Check-in',
  feed: 'Circle',
  recap: 'Recap',
};

interface FillColors {
  from: string;
  to: string;
}

/**
 * Floating liquid-glass tab bar, narrower than the screen so it visibly
 * floats rather than spanning edge to edge. Check-in sits in a raised
 * center button (bigger, poking above the pill) with Recap and Circle as
 * smaller icons on either side. The tint reveals left-to-right like liquid
 * filling the glass — driven by the same spillRequest/SPILL_TRAVEL_MS as
 * the traveling drop in PaintSpill, so the fill finishes exactly as the
 * drop visually arrives — and the same reveal plays across the raised
 * button too, so the whole bar reads as one connected glass surface.
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const spillRequest = useMoodStore((s) => s.spillRequest);

  const [barWidth, setBarWidth] = useState(0);
  const prevColorRef = useRef<string>(NEUTRAL_TINT);
  const lastHandledId = useRef<number | null>(null);
  const [fillColors, setFillColors] = useState<FillColors>({
    from: NEUTRAL_TINT,
    to: NEUTRAL_TINT,
  });
  const fillProgress = useSharedValue(0);

  useEffect(() => {
    if (!spillRequest || spillRequest.id === lastHandledId.current) return;
    lastHandledId.current = spillRequest.id;

    const nextColor = MOOD_COLORS[spillRequest.mood].base;
    setFillColors({ from: prevColorRef.current, to: nextColor });
    fillProgress.value = 0;
    fillProgress.value = withTiming(1, {
      duration: SPILL_TRAVEL_MS,
      easing: Easing.out(Easing.cubic),
    });
    prevColorRef.current = nextColor;
  }, [spillRequest, fillProgress]);

  const revealStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (fillProgress.value - 1) * barWidth }],
  }));

  const onBarLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  const indexGlobalIndex = state.routes.findIndex((r) => r.name === 'index');
  const indexRoute = state.routes[indexGlobalIndex];
  const sideRoutes = state.routes.filter((r) => r.name !== 'index');
  const isIndexFocused = state.index === indexGlobalIndex;

  const makeOnPress = (routeKey: string, routeName: string, isFocused: boolean) => () => {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: insets.bottom + Spacing.sm }]}
    >
      <View style={styles.bar} onLayout={onBarLayout}>
        <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tint, { backgroundColor: fillColors.from }]} />
        <Animated.View style={[StyleSheet.absoluteFill, revealStyle]}>
          <View style={[StyleSheet.absoluteFill, styles.tint, { backgroundColor: fillColors.to }]} />
        </Animated.View>
        <View style={styles.edgeHighlight} pointerEvents="none" />
        <View style={styles.row}>
          {sideRoutes.map((route) => {
            const { options } = descriptors[route.key];
            const isFocused = state.routes[state.index].key === route.key;
            const label = TAB_LABEL[route.name] ?? route.name;
            return (
              <SideTabButton
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                label={label}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                onPress={makeOnPress(route.key, route.name, isFocused)}
              />
            );
          })}
        </View>
      </View>

      {indexRoute && (
        <RaisedCheckinButton
          isFocused={isIndexFocused}
          fillColors={fillColors}
          fillProgress={fillProgress}
          label={TAB_LABEL.index}
          onPress={makeOnPress(indexRoute.key, indexRoute.name, isIndexFocused)}
        />
      )}
    </View>
  );
}

function SideTabButton({
  routeName,
  isFocused,
  label,
  accessibilityLabel,
  onPress,
}: {
  routeName: string;
  isFocused: boolean;
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const focus = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focus.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
  }, [isFocused, focus]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(focus.value, [0, 1], [0.55, 1]),
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      style={styles.tabButton}
      hitSlop={8}
    >
      <Animated.View style={[styles.tabButtonInner, style]}>
        <TabGlyph route={routeName} active={isFocused} />
        <Text style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function RaisedCheckinButton({
  isFocused,
  fillColors,
  fillProgress,
  label,
  onPress,
}: {
  isFocused: boolean;
  fillColors: FillColors;
  fillProgress: ReturnType<typeof useSharedValue<number>>;
  label: string;
  onPress: () => void;
}) {
  const revealStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (fillProgress.value - 1) * RAISED_SIZE }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      style={styles.raisedWrapper}
      hitSlop={6}
    >
      <View style={[styles.raisedCircle, isFocused && styles.raisedCircleActive]}>
        <BlurView intensity={54} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.raisedTint, { backgroundColor: fillColors.from }]} />
        <Animated.View style={[StyleSheet.absoluteFill, revealStyle]}>
          <View style={[StyleSheet.absoluteFill, styles.raisedTint, { backgroundColor: fillColors.to }]} />
        </Animated.View>
        <View style={styles.raisedGlyph} />
      </View>
    </Pressable>
  );
}

function TabGlyph({ route, active }: { route: string; active: boolean }) {
  const tone = active ? Chrome.text : Chrome.textMuted;
  if (route === 'feed') {
    return (
      <View style={styles.glyphCluster}>
        <View style={[styles.glyphDot, { backgroundColor: tone, opacity: 0.55 }]} />
        <View style={[styles.glyphDot, styles.glyphDotOverlap, { backgroundColor: tone }]} />
      </View>
    );
  }
  if (route === 'recap') {
    return <View style={[styles.glyphGlass, { borderColor: tone }]} />;
  }
  return <View style={[styles.glyphDroplet, { backgroundColor: tone }]} />;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    width: '78%',
    maxWidth: 320,
    height: TAB_BAR_HEIGHT,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Chrome.borderStrong,
  },
  tint: { opacity: 0.32 },
  edgeHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: { ...Typography.caption, fontSize: 11 },
  labelActive: { color: Chrome.text, fontWeight: '600' },
  labelInactive: { color: Chrome.textMuted },
  glyphDroplet: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  glyphGlass: {
    width: 13,
    height: 15,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  glyphCluster: {
    flexDirection: 'row',
    width: 20,
    height: 14,
    alignItems: 'center',
  },
  glyphDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    position: 'absolute',
    left: 0,
  },
  glyphDotOverlap: {
    left: 8,
  },
  raisedWrapper: {
    position: 'absolute',
    top: -RAISED_POKE,
    left: '50%',
    marginLeft: -RAISED_SIZE / 2,
    width: RAISED_SIZE,
    height: RAISED_SIZE,
  },
  raisedCircle: {
    flex: 1,
    borderRadius: RAISED_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Chrome.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raisedCircleActive: {
    borderColor: Chrome.text,
  },
  raisedTint: { opacity: 0.34 },
  raisedGlyph: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Chrome.text,
  },
});
