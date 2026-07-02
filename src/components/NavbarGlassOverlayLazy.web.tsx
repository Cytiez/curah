import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web/WithSkiaWeb';

import { skiaWebOpts } from '@/lib/skiaWebOpts';

interface NavbarGlassOverlayLazyProps {
  width: number;
  height: number;
  barWidth: number;
  barHeight: number;
  barRadius: number;
  bumpSize: number;
}

/**
 * Web-only: defers evaluating NavbarGlassOverlay.tsx (and its
 * `@shopify/react-native-skia` import) until CanvasKit's WASM has finished
 * loading. See NavbarGlassOverlayLazy.native.tsx for the plain native
 * version — this problem doesn't exist there.
 */
export function NavbarGlassOverlayLazy(props: NavbarGlassOverlayLazyProps) {
  return (
    <WithSkiaWeb<NavbarGlassOverlayLazyProps>
      getComponent={() =>
        import('./NavbarGlassOverlay').then((m) => ({ default: m.NavbarGlassOverlay }))
      }
      componentProps={props}
      opts={skiaWebOpts}
    />
  );
}
