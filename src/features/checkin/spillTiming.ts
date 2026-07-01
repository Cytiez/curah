/**
 * Shared between PaintSpill (the traveling drop) and GlassTabBar (the fill
 * wipe it triggers), so both animations are driven by the same trigger and
 * duration and always finish together — the drop visually "arrives" exactly
 * as the navbar finishes filling with its color.
 */
export const SPILL_TRAVEL_MS = 620;
