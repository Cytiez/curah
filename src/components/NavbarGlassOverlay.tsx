import { Canvas, Group, LinearGradient, Path, Rect, vec } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { buildNavbarUnionPath } from './navbarPath';

// A single flat object, not `[StyleSheet.absoluteFill, {...}]` — Skia's web
// Canvas crashes on a style array ("Failed to set an indexed property...").
// Also `pointerEvents` must live in the style object rather than as its own
// prop: as a prop it's silently ignored on Skia's web Canvas, leaving the
// canvas capturing clicks meant for the buttons underneath it.
const overlayStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none' as const,
};

interface NavbarGlassOverlayProps {
  /** Full bounding box of the pill+bump stack. */
  width: number;
  height: number;
  barWidth: number;
  barHeight: number;
  barRadius: number;
  bumpSize: number;
}

/**
 * Decorative pass drawn on top of the two real BlurView pieces: one
 * continuous stroke tracing the pill+bump's true union silhouette, plus a
 * soft diagonal light sheen clipped to that same silhouette — the "catching
 * the light" cue that reads as liquid glass even once a mood tint sits
 * underneath it. Doesn't touch the blur itself (see navbarPath.ts).
 */
export function NavbarGlassOverlay({
  width,
  height,
  barWidth,
  barHeight,
  barRadius,
  bumpSize,
}: NavbarGlassOverlayProps) {
  const path = useMemo(() => {
    const bumpRadius = bumpSize / 2;
    const bumpCenterX = width / 2;
    const bumpCenterY = bumpRadius;
    const barX = (width - barWidth) / 2;
    const barY = height - barHeight;
    return buildNavbarUnionPath(
      bumpCenterX,
      bumpCenterY,
      bumpRadius,
      barX,
      barY,
      barWidth,
      barHeight,
      barRadius,
    );
  }, [width, height, barWidth, barHeight, barRadius, bumpSize]);

  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    <Canvas style={overlayStyle}>
      <Group clip={path}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width * 0.6, height)}
            colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
            positions={[0, 0.4, 0.85]}
          />
        </Rect>
      </Group>
      <Path path={path} style="stroke" strokeWidth={1.25} color="rgba(255,255,255,0.34)" />
    </Canvas>
  );
}
