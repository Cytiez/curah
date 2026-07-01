import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { buildBottomUpFillPath, buildNavbarShapePath } from './navbarPath';

const GLASS_BASE_COLOR = '#0E0E10';

export interface NavbarShapeProps {
  width: number;
  pillTop: number;
  pillHeight: number;
  bumpRadius: number;
  fillColors: { from: string; to: string };
  fillProgress: SharedValue<number>;
  /** 0..1, brightens the ring drawn around the raised bump when it's focused. */
  raisedFocus: SharedValue<number>;
}

/**
 * Renders the navbar's chrome as one seamless union shape (pill + raised
 * bump, boolean-merged — see navbarPath.ts) instead of two overlapping
 * pieces. The mood tint fills from the bottom up, clipped to the true
 * silhouette, so it naturally rises into the bump once the level is high
 * enough. There's no real backdrop blur here (Skia draws solid translucent
 * fills, not a live blur sample of what's behind) — a deliberate trade-off
 * to get the true unioned shape without adding a masked-blur dependency.
 */
export function NavbarShape({
  width,
  pillTop,
  pillHeight,
  bumpRadius,
  fillColors,
  fillProgress,
  raisedFocus,
}: NavbarShapeProps) {
  const canvasHeight = pillTop + pillHeight;

  const shapePath = useDerivedValue(() => buildNavbarShapePath(width, pillTop, pillHeight, bumpRadius));
  const fillPath = useDerivedValue(() => buildBottomUpFillPath(width, canvasHeight, fillProgress.value));
  const bumpRingPath = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.addCircle(width / 2, pillTop, bumpRadius - 1);
    return p;
  });
  const bumpRingColor = useDerivedValue(() => {
    const alpha = Math.round((0.22 + raisedFocus.value * 0.58) * 255)
      .toString(16)
      .padStart(2, '0');
    return `#F5F0E8${alpha}`;
  });

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Path path={shapePath} color={GLASS_BASE_COLOR} opacity={0.62} />
      <Group clip={shapePath}>
        <Path path={shapePath} color={fillColors.from} opacity={0.32} />
        <Path path={fillPath} color={fillColors.to} opacity={0.32} />
      </Group>
      <Path path={shapePath} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.16)" />
      <Path path={bumpRingPath} style="stroke" strokeWidth={1.5} color={bumpRingColor} />
    </Canvas>
  );
}
