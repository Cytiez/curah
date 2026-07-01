import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web/WithSkiaWeb';

import type { Mood } from '@/features/mood/types';
import { skiaWebOpts } from '@/lib/skiaWebOpts';

interface RecapGlassLazyProps {
  shares: Record<Mood, number>;
  replayKey: number;
}

/**
 * Web-only: defers evaluating RecapGlass.tsx (and its `@shopify/react-native-skia`
 * import) until CanvasKit's WASM has finished loading. See RecapGlassLazy.native.tsx
 * for the plain native version — this problem doesn't exist there.
 */
export function RecapGlassLazy(props: RecapGlassLazyProps) {
  return (
    <WithSkiaWeb<RecapGlassLazyProps>
      getComponent={() => import('./RecapGlass').then((m) => ({ default: m.RecapGlass }))}
      componentProps={props}
      opts={skiaWebOpts}
    />
  );
}
