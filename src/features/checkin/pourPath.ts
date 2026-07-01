import { Skia, type SkPath } from '@shopify/react-native-skia';

/**
 * A sagging quadratic-bezier arc from the tapped mood's position to the
 * navbar target — gravity-poured feel, not a straight/thrown line. Reused
 * as a stroke path so the pour can be trimmed (start/end) to reveal
 * continuously rather than moving a single dot along it.
 * Worklet: called from useDerivedValue on the UI thread.
 */
export function buildPourArcPath(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  sag: number,
): SkPath {
  'worklet';
  const controlX = (originX + targetX) / 2;
  const controlY = (originY + targetY) / 2 + sag;
  const path = Skia.Path.Make();
  path.moveTo(originX, originY);
  path.quadTo(controlX, controlY, targetX, targetY);
  return path;
}
