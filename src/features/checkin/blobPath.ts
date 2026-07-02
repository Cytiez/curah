import { Skia, type SkPath } from '@shopify/react-native-skia';

/**
 * Builds a smooth, organic closed blob shape: N points around a circle,
 * each pushed in/out by a couple of layered sine waves (different phase per
 * point) so the whole shape wobbles continuously like liquid rather than
 * uniformly breathing. Connected with the midpoint-quadratic technique,
 * which keeps every join C1-smooth without needing full spline math.
 *
 * Worklet: called from useDerivedValue on the UI thread.
 */
export function buildBlobPath(
  cx: number,
  cy: number,
  baseRadius: number,
  t: number,
  seed: number,
): SkPath {
  'worklet';
  const pointCount = 8;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const phase = i * 1.31 + seed;
    const wobble =
      Math.sin(t * Math.PI * 2 + phase) * 0.09 +
      Math.sin(t * Math.PI * 2 * 2 + phase * 1.9) * 0.045;
    const r = baseRadius * (1 + wobble);
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }

  const path = Skia.Path.Make();
  const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const start = midpoint(points[pointCount - 1], points[0]);
  path.moveTo(start.x, start.y);
  for (let i = 0; i < pointCount; i++) {
    const next = points[(i + 1) % pointCount];
    const m = midpoint(points[i], next);
    path.quadTo(points[i].x, points[i].y, m.x, m.y);
  }
  path.close();
  return path;
}
