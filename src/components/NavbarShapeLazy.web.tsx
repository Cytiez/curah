import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web/WithSkiaWeb';

import { skiaWebOpts } from '@/lib/skiaWebOpts';
import type { NavbarShapeProps } from './NavbarShape';

/**
 * Web-only: defers evaluating NavbarShape.tsx (and its `@shopify/react-native-skia`
 * import) until CanvasKit's WASM has finished loading. See NavbarShapeLazy.native.tsx
 * for the plain native version — this problem doesn't exist there.
 */
export function NavbarShapeLazy(props: NavbarShapeProps) {
  return (
    <WithSkiaWeb<NavbarShapeProps>
      getComponent={() => import('./NavbarShape').then((m) => ({ default: m.NavbarShape }))}
      componentProps={props}
      opts={skiaWebOpts}
    />
  );
}
