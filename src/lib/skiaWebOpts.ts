/**
 * Web-only CanvasKit loader options, shared by every `.web.tsx` Skia lazy
 * wrapper. Metro's web dev server doesn't serve the local canvaskit.wasm
 * with the right MIME type, so we fetch it from a CDN instead — pinned to
 * match the installed canvaskit-wasm version exactly (mismatched JS
 * glue/wasm versions can fail in confusing ways).
 */
export const skiaWebOpts = {
  locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.0/bin/full/${file}`,
};
