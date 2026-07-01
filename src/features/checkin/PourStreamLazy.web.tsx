import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web/WithSkiaWeb';
import type { SharedValue } from 'react-native-reanimated';

import { skiaWebOpts } from '@/lib/skiaWebOpts';

interface PourStreamLazyProps {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  color: string;
  progress: SharedValue<number>;
}

/**
 * Web-only: defers evaluating PourStream.tsx (and its `@shopify/react-native-skia`
 * import) until CanvasKit's WASM has finished loading. See PourStreamLazy.native.tsx
 * for the plain native version — this problem doesn't exist there.
 */
export function PourStreamLazy(props: PourStreamLazyProps) {
  return (
    <WithSkiaWeb<PourStreamLazyProps>
      getComponent={() => import('./PourStream').then((m) => ({ default: m.PourStream }))}
      componentProps={props}
      opts={skiaWebOpts}
    />
  );
}
