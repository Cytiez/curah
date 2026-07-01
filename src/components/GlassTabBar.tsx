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
import { Chrome, MOOD_COLORS, Spacing, Typography } from '@/theme';
import { NavbarShapeLazy } from './NavbarShapeLazy';

export const TAB_BAR_HEIGHT = 64;
const NEUTRAL_TINT = Chrome.surfaceElevated;
const RAISED_SIZE = 68;
const RAISED_POKE = 40;
const CANVAS_HEIGHT = RAISED_POKE + TAB_BAR_HEIGHT;
const SIDE_PADDING = Spacing.lg;

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
 * floats. The pill and the raised Check-in bump are rendered as ONE
 * boolean-unioned Skia shape (see NavbarShape/navbarPath) rather than two
 * overlapping pieces — "kayak di union". The mood tint fills bottom-to-top,
 * driven by the same spillRequest/SPILL_TRAVEL_MS as the pour stream in
 * PaintSpill, so the fill finishes exactly as the pour arrives, and rises
 * into the bump once the level is high enough since both are clipped to the
 * same real silhouette.
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
  const raisedFocus = useSharedValue(1);

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

  useEffect(() => {
    raisedFocus.value = withTiming(isIndexFocused ? 1 : 0, { duration: 220 });
  }, [isIndexFocused, raisedFocus]);

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
      <View style={styles.canvasBox} onLayout={onBarLayout}>
        {barWidth > 0 && (
          <NavbarShapeLazy
            width={barWidth}
            pillTop={RAISED_POKE}
            pillHeight={TAB_BAR_HEIGHT}
            bumpRadius={RAISED_SIZE / 2}
            fillColors={fillColors}
            fillProgress={fillProgress}
            raisedFocus={raisedFocus}
          />
        )}

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

        {indexRoute && (
          <Pressable
            onPress={makeOnPress(indexRoute.key, indexRoute.name, isIndexFocused)}
            accessibilityRole="button"
            accessibilityState={isIndexFocused ? { selected: true } : {}}
            accessibilityLabel={TAB_LABEL.index}
            style={styles.raisedButton}
            hitSlop={6}
          >
            <View style={styles.raisedGlyph} />
          </Pressable>
        )}
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
  canvasBox: {
    width: '78%',
    maxWidth: 320,
    height: CANVAS_HEIGHT,
  },
  sideRow: {
    position: 'absolute',
    top: RAISED_POKE,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
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
    position: 'absolute',
    top: RAISED_POKE - RAISED_SIZE / 2,
    left: '50%',
    marginLeft: -RAISED_SIZE / 2,
    width: RAISED_SIZE,
    height: RAISED_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raisedGlyph: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Chrome.text,
  },
});
