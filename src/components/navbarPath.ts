import { PathOp, Skia, type SkPath } from '@shopify/react-native-skia';

/**
 * The navbar's chrome as ONE seamless shape: a pill merged with a circular
 * bump poking above it (boolean union, not two overlapping shapes with
 * visible seams) — "kayak di union" per the brief. The bump's center sits
 * exactly on the pill's top edge, so roughly half of it pokes above.
 * Worklet: called from useDerivedValue on the UI thread.
 */
export function buildNavbarShapePath(
  width: number,
  pillTop: number,
  pillHeight: number,
  bumpRadius: number,
): SkPath {
  'worklet';
  const pill = Skia.Path.Make();
  pill.addRRect(Skia.RRectXY(Skia.XYWHRect(0, pillTop, width, pillHeight), pillHeight / 2, pillHeight / 2));

  const bump = Skia.Path.Make();
  bump.addCircle(width / 2, pillTop, bumpRadius);

  const unioned = Skia.Path.MakeFromOp(pill, bump, PathOp.Union);
  return unioned ?? pill;
}

/**
 * The portion of the union shape currently "filled", growing from the
 * bottom of the canvas upward as `fillProgress` goes 0..1 — clipped against
 * the union shape by the caller (Group clip), so it naturally only shows
 * inside the real silhouette, including rising into the bump once the level
 * gets that high.
 * Worklet: called from useDerivedValue on the UI thread.
 */
export function buildBottomUpFillPath(width: number, canvasHeight: number, fillProgress: number): SkPath {
  'worklet';
  const path = Skia.Path.Make();
  const fillTop = canvasHeight * (1 - fillProgress);
  path.addRect(Skia.XYWHRect(0, fillTop, width, canvasHeight - fillTop));
  return path;
}
