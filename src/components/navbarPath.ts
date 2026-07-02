import { PathOp, Skia, type SkPath } from '@shopify/react-native-skia';

/**
 * The navbar's true union silhouette (pill + raised bump merged into one
 * outline), used only to draw a decorative stroke/sheen on top of the two
 * real BlurViews — NOT to mask or clip the blur itself. Skia can't be
 * masked by expo-blur's native BlurView (that's what killed the earlier
 * all-Skia navbar attempt), but a thin outline overlay sitting on top of
 * two overlapping, individually-blurred pieces doesn't need that: the
 * blur/tint keep coming from the real BlurViews underneath, this just
 * traces where their combined silhouette actually is.
 */
export function buildNavbarUnionPath(
  bumpCenterX: number,
  bumpCenterY: number,
  bumpRadius: number,
  barX: number,
  barY: number,
  barWidth: number,
  barHeight: number,
  barRadius: number,
): SkPath {
  const bump = Skia.Path.Make();
  bump.addCircle(bumpCenterX, bumpCenterY, bumpRadius);

  const pill = Skia.Path.Make();
  const r = Math.min(barRadius, barHeight / 2, barWidth / 2);
  pill.addRRect(Skia.RRectXY(Skia.XYWHRect(barX, barY, barWidth, barHeight), r, r));

  return Skia.Path.MakeFromOp(pill, bump, PathOp.Union) ?? pill;
}
