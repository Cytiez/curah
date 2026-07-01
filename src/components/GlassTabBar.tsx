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

import { LiquidFillLazy } from '@/components/LiquidFillLazy';
import { SPILL_TRAVEL_MS } from '@/features/checkin/spillTiming';
import { useMoodStore } from '@/store/useMoodStore';
import { Chrome, MOOD_COLORS, Radius, Spacing, Typography } from '@/theme';

export const TAB_BAR_HEIGHT = 64;
export const RAISED_SIZE = 60;
export const RAISED_GAP = 10;
/** Total floating-nav footprint (raised button + gap + pill) screens should
 * pad their bottom content by, so nothing sits under the detached button. */
export const NAVBAR_CLEARANCE = RAISED_SIZE + RAISED_GAP + TAB_BAR_HEIGHT;
const NEUTRAL_TINT = Chrome.surfaceElevated;
const SIDE_PADDING = Spacing.lg;
const TINT_OPACITY = 0.32;

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
 * Floating liquid-glass tab bar: a pill (Recap + Circle) with the Check-in
 * button as its own DETACHED floating circle above it, not merged into one
 * shape. Earlier attempts tried a true boolean-unioned Skia shape ("kayak
 * union") but that meant losing real backdrop blur (Skia can't be masked by
 * expo-blur) and looked worse in practice. Checked against real iOS 26
 * guidance in the meantime: Apple's own floating-pill tab bar keeps its
 * primary action button as a separate detached glass piece next to/above
 * the bar rather than merging it in — so this detached layout isn't just a
 * fallback, it's the proven pattern. Both pieces share the same
 * spillRequest-driven fill, revealing bottom-to-top in sync.
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
      {indexRoute && (
        <Pressable
          onPress={makeOnPress(indexRoute.key, indexRoute.name, isIndexFocused)}
          accessibilityRole="button"
          accessibilityState={isIndexFocused ? { selected: true } : {}}
          accessibilityLabel={TAB_LABEL.index}
          style={[styles.raisedButton, isIndexFocused && styles.raisedButtonActive]}
          hitSlop={6}
        >
          <BlurView intensity={54} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.tint, { backgroundColor: fillColors.from }]} />
          <LiquidFillLazy
            width={RAISED_SIZE}
            height={RAISED_SIZE}
            borderRadius={RAISED_SIZE / 2}
            color={fillColors.to}
            opacity={TINT_OPACITY}
            progress={fillProgress}
          />
          <View style={styles.raisedGlyph} />
        </Pressable>
      )}

      <View style={styles.bar} onLayout={onBarLayout}>
        <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tint, { backgroundColor: fillColors.from }]} />
        {barWidth > 0 && (
          <LiquidFillLazy
            width={barWidth}
            height={TAB_BAR_HEIGHT}
            borderRadius={Radius.pill}
            color={fillColors.to}
            opacity={TINT_OPACITY}
            progress={fillProgress}
          />
        )}
        <View style={styles.edgeHighlight} pointerEvents="none" />
        <View style={styles.sideRow}>
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
  tint: { opacity: TINT_OPACITY },
  edgeHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  sideRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
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
  raisedButton: {
    width: RAISED_SIZE,
    height: RAISED_SIZE,
    borderRadius: RAISED_SIZE / 2,
    overflow: 'hidden',
    marginBottom: RAISED_GAP,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Chrome.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raisedButtonActive: {
    borderColor: Chrome.text,
  },
  raisedGlyph: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Chrome.text,
  },
});
