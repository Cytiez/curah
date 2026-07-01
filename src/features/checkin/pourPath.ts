import { Skia, type SkPath } from '@shopify/react-native-skia';

const SEGMENTS = 32;

function smoothstep(t: number): number {
  'worklet';
  return t * t * (3 - 2 * t);
}

/**
 * A liquid ribbon (not a stroked line) along a sagging quadratic-bezier arc
 * from the tapped mood's position to the navbar — gravity-poured, not a
 * straight/thrown line. Built as a filled, wobbly shape whose edges are
 * smoothed through quad-through-midpoint curves (not straight lineTo
 * segments) so it reads as a soft liquid surface instead of a faceted
 * marker stroke.
 *
 * Width tapers from `originWidth` (matching the tapped blob, so the tail
 * fully covers it) down to `targetWidth` (matching the navbar's raised
 * button, so the head doesn't float wider than the thing it's pouring
 * into) — big at the source, shrinking toward the destination.
 *
 * `start`/`end` (0..1) select the currently-visible portion of the full arc,
 * matching PourStream's timeline (0→1 pours, 1→2 drains by advancing start).
 * The rounded end caps are separate shapes (see buildHeadCapPath /
 * buildTailCapPath) drawn on top, rather than extra contours on this path —
 * merging them here risked opposite-winding cancellation with the ribbon,
 * carving a hole where the two overlapped.
 */
export function buildLiquidStreamPath(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  sag: number,
  start: number,
  end: number,
  originWidth: number,
  targetWidth: number,
  wobblePhase: number,
): SkPath {
  'worklet';
  const path = Skia.Path.Make();
  if (end - start < 0.001) {
    return path;
  }

  const controlX = (originX + targetX) / 2;
  const controlY = (originY + targetY) / 2 + sag;

  const leftX: number[] = [];
  const leftY: number[] = [];
  const rightX: number[] = [];
  const rightY: number[] = [];

  for (let i = 0; i <= SEGMENTS; i++) {
    const localT = i / SEGMENTS;
    const t = start + (end - start) * localT;
    const omt = 1 - t;

    const px = omt * omt * originX + 2 * omt * t * controlX + t * t * targetX;
    const py = omt * omt * originY + 2 * omt * t * controlY + t * t * targetY;

    const tx = 2 * omt * (controlX - originX) + 2 * t * (targetX - controlX);
    const ty = 2 * omt * (controlY - originY) + 2 * t * (targetY - controlY);
    const tlen = Math.sqrt(tx * tx + ty * ty) || 1;
    const nx = -ty / tlen;
    const ny = tx / tlen;

    const widthAt = originWidth + (targetWidth - originWidth) * smoothstep(localT);
    const wobble =
      1 +
      0.1 * Math.sin(localT * Math.PI * 2.6 + wobblePhase) +
      0.06 * Math.sin(localT * Math.PI * 4.4 - wobblePhase * 1.3);
    const halfWidth = (widthAt / 2) * wobble;

    leftX.push(px + nx * halfWidth);
    leftY.push(py + ny * halfWidth);
    rightX.push(px - nx * halfWidth);
    rightY.push(py - ny * halfWidth);
  }

  // Left edge: tail -> head, smoothed through midpoints so the outline
  // curves rather than faceting at every sampled wobble point.
  path.moveTo(leftX[0], leftY[0]);
  for (let i = 1; i < SEGMENTS; i++) {
    const mx = (leftX[i] + leftX[i + 1]) / 2;
    const my = (leftY[i] + leftY[i + 1]) / 2;
    path.quadTo(leftX[i], leftY[i], mx, my);
  }
  path.lineTo(leftX[SEGMENTS], leftY[SEGMENTS]);
  path.lineTo(rightX[SEGMENTS], rightY[SEGMENTS]);

  // Right edge: head -> tail, smoothed the same way.
  for (let i = SEGMENTS - 1; i > 0; i--) {
    const mx = (rightX[i] + rightX[i - 1]) / 2;
    const my = (rightY[i] + rightY[i - 1]) / 2;
    path.quadTo(rightX[i], rightY[i], mx, my);
  }
  path.lineTo(rightX[0], rightY[0]);
  path.close();

  return path;
}

function pointAndWidthAt(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  sag: number,
  t: number,
  originWidth: number,
  targetWidth: number,
  wobblePhase: number,
) {
  'worklet';
  const controlX = (originX + targetX) / 2;
  const controlY = (originY + targetY) / 2 + sag;
  const omt = 1 - t;
  const px = omt * omt * originX + 2 * omt * t * controlX + t * t * targetX;
  const py = omt * omt * originY + 2 * omt * t * controlY + t * t * targetY;
  const widthAt = originWidth + (targetWidth - originWidth) * smoothstep(t);
  const wobble =
    1 +
    0.1 * Math.sin(t * Math.PI * 2.6 + wobblePhase) +
    0.06 * Math.sin(t * Math.PI * 4.4 - wobblePhase * 1.3);
  return { x: px, y: py, halfWidth: (widthAt / 2) * wobble };
}

/**
 * The rounded droplet cap at the pour's leading edge (the end nearest the
 * target/navbar), drawn as its own filled circle on top of the ribbon so
 * they never fight over path winding direction — same solid color, no
 * stroke, so the seam between them is invisible. Sized to match the
 * ribbon's own tapered width at that point (shrinking toward the navbar),
 * not a fixed size, so it never floats larger than what it's pouring into.
 */
export function buildHeadCapPath(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  sag: number,
  start: number,
  end: number,
  originWidth: number,
  targetWidth: number,
  wobblePhase: number,
): SkPath {
  'worklet';
  const path = Skia.Path.Make();
  if (end - start < 0.001) {
    return path;
  }
  const { x, y, halfWidth } = pointAndWidthAt(
    originX,
    originY,
    targetX,
    targetY,
    sag,
    end,
    originWidth,
    targetWidth,
    wobblePhase,
  );
  path.addCircle(x, y, halfWidth * 1.05);
  return path;
}

/**
 * The rounded cap at the pour's trailing edge (the end anchored at the
 * tapped mood blob), drawn the same way as the head cap. Only visible while
 * the tail is still anchored at the origin (before the drain phase starts
 * pulling it away) — this is what makes an off-center tap fully "close" the
 * gap between the pressed spot and the blob's real shape: this cap is
 * always centered on the blob's true measured center (passed in as
 * originX/Y by the caller) regardless of where within the blob was tapped.
 */
export function buildTailCapPath(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  sag: number,
  start: number,
  end: number,
  originWidth: number,
  targetWidth: number,
  wobblePhase: number,
): SkPath {
  'worklet';
  const path = Skia.Path.Make();
  if (end - start < 0.001 || start > 0.001) {
    return path;
  }
  const { x, y, halfWidth } = pointAndWidthAt(
    originX,
    originY,
    targetX,
    targetY,
    sag,
    0,
    originWidth,
    targetWidth,
    wobblePhase,
  );
  path.addCircle(x, y, halfWidth * 1.02);
  return path;
}
