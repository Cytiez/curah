import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web/WithSkiaWeb';

import { skiaWebOpts } from '@/lib/skiaWebOpts';

interface LiquidBlobLazyProps {
  color: string;
  seed: number;
}

/**
 * Web-only: defers evaluating LiquidBlob.tsx (and its `@shopify/react-native-skia`
 * import) until CanvasKit's WASM has finished loading. See LiquidBlobLazy.native.tsx
 * for the plain native version — this problem doesn't exist there.
 */
export function LiquidBlobLazy(props: LiquidBlobLazyProps) {
  return (
    <WithSkiaWeb<LiquidBlobLazyProps>
      getComponent={() => import('./LiquidBlob').then((m) => ({ default: m.LiquidBlob }))}
      componentProps={props}
      opts={skiaWebOpts}
    />
  );
}
