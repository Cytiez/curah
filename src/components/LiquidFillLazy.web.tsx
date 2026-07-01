import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web/WithSkiaWeb';
import type { SharedValue } from 'react-native-reanimated';

import { skiaWebOpts } from '@/lib/skiaWebOpts';

interface LiquidFillLazyProps {
  width: number;
  height: number;
  borderRadius: number;
  color: string;
  opacity: number;
  progress: SharedValue<number>;
}

/**
 * Web-only: defers evaluating LiquidFill.tsx (and its `@shopify/react-native-skia`
 * import) until CanvasKit's WASM has finished loading. See LiquidFillLazy.native.tsx
 * for the plain native version — this problem doesn't exist there.
 */
export function LiquidFillLazy(props: LiquidFillLazyProps) {
  return (
    <WithSkiaWeb<LiquidFillLazyProps>
      getComponent={() => import('./LiquidFill').then((m) => ({ default: m.LiquidFill }))}
      componentProps={props}
      opts={skiaWebOpts}
    />
  );
}
