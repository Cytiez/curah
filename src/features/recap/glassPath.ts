import { Skia, type SkPath } from '@shopify/react-native-skia';

/**
 * A simple tapered drinking-glass silhouette: wide at the top, narrower at
 * the bottom, with a rounded bottom edge. Used both to draw the glass
 * outline and as a clip for the liquid layers inside it.
 * Worklet: called from useDerivedValue on the UI thread.
 */
export function buildGlassPath(width: number, height: number): SkPath {
  'worklet';
  const bottomInset = width * 0.12;
  const cornerRadius = Math.min(16, bottomInset);
  const path = Skia.Path.Make();
  path.moveTo(0, 0);
  path.lineTo(width, 0);
  path.lineTo(width - bottomInset, height - cornerRadius);
  path.quadTo(width - bottomInset, height, width - bottomInset - cornerRadius, height);
  path.lineTo(bottomInset + cornerRadius, height);
  path.quadTo(bottomInset, height, bottomInset, height - cornerRadius);
  path.close();
  return path;
}

/**
 * One liquid layer: a band from `bottomY` to `topY`, full canvas width (the
 * glass clip tapers the sides for us), with a gently wavy top edge so it
 * reads as a real liquid surface rather than a flat rectangle.
 * Worklet: called from useDerivedValue on the UI thread.
 */
export function buildLiquidLayerPath(
  width: number,
  topY: number,
  bottomY: number,
  wavePhase: number,
  waveAmplitude: number = 5,
): SkPath {
  'worklet';
  const path = Skia.Path.Make();
  if (bottomY <= topY) {
    return path;
  }
  const waveFrequency = 1.6;
  const segments = 20;

  path.moveTo(0, bottomY);
  path.lineTo(0, topY);
  for (let i = 1; i <= segments; i++) {
    const x = (i / segments) * width;
    const y = topY + Math.sin((i / segments) * Math.PI * 2 * waveFrequency + wavePhase) * waveAmplitude;
    path.lineTo(x, y);
  }
  path.lineTo(width, bottomY);
  path.close();
  return path;
}
