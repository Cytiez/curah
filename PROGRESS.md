# Curah — Progress Summary

_Last updated: 2026-07-02. Written for handoff to a fresh Claude chat — read this before making changes._

## What this is

Curah is a mood check-in app. You tap a color/shape representing how you feel (no
writing required), it optionally shares to a small private "circle" of close friends
(not public), and a daily recap shows the day's moods stacked like layers in a glass.
The differentiator is the private circle-sharing layer, not the mood-tracking itself
(that part is table stakes — see `project-context-mood-circle.md` for the original
product research that led here).

**Phase 1 (current)**: UI/animation craft for the 3 core screens using local mock
data. Supabase is schema'd but **not wired up** — everything runs in-memory via
Zustand. This was a deliberate choice: get the feel right first, wire up the backend
once the interactions are proven out.

## Stack

- Expo SDK 57 (managed), Expo Router (file-based), TypeScript strict
- React Native 0.86, React 19.2, Reanimated 4.5, react-native-worklets
- `@shopify/react-native-skia` 2.6.2 — all the custom organic/liquid shapes
- `expo-blur` — real backdrop blur for the navbar's glass effect
- Zustand — app state (mood logs, current mood, sharing default, spill trigger)
- Supabase JS client installed, schema drafted, **not connected**
- Jest + @testing-library/react-native for unit tests (mood aggregation logic only
  so far — no component/animation tests)

Read `AGENTS.md` before touching anything Expo-version-specific — it points at the
exact versioned docs since Expo APIs shift a lot between versions.

## The 3 screens

**Check-in** (`src/app/(tabs)/index.tsx`) — 6 mood blobs (Senang, Tenang, Netral,
Sedih, Marah, Cemas) laid out organically (`OrganicMoodLayout.tsx`), each rendered as
a continuously-morphing liquid shape via Skia (`LiquidBlob.tsx`), not a static circle.
Positions re-jitter slightly every time the tab regains focus, without changing their
base layout. Tapping a blob fires a haptic, logs the mood, and triggers a paint-spill
animation. A Pribadi/Circle sharing toggle sits below (default: Pribadi/private —
deliberately anti-dark-pattern).

**Circle / Feed** (`src/app/(tabs)/feed.tsx`) — X-style reverse-chronological
timeline of shared mood logs from your circle. Plain `FlatList`, no infinite scroll,
no like/vanity metrics. Multiple logs from the same person on the same day show as
separate rows (not collapsed).

**Recap** (`src/app/(tabs)/recap.tsx`) — "Gelas Hari Ini" (today's glass): a real
glass silhouette (Skia) containing stacked, discrete (not blended) color bands, one
per mood logged today, proportional to share of the day. Auto-replays its settle-in
animation every time the tab is focused (no manual replay button anymore — that was
removed early on).

## The navbar (this is where most of the recent iteration happened)

`src/components/GlassTabBar.tsx` — **settled back to one flat pill, all three tabs
(Recap, Check-in, Circle) in a row on equal footing.** This went through several
complete rewrites this session before landing here:

1. First built as a true boolean-unioned Skia shape (pill + a raised Check-in bump,
   via `PathOp.Union`) — worked, but meant losing real backdrop blur (Skia can't
   mask `expo-blur`'s native BlurView to an arbitrary path), so it looked flat/fake.
2. Reverted to two fully detached pieces (real blur each) with a visible gap —
   technically correct blur, but looked disconnected.
3. Rebuilt as two real `BlurView` pieces that geometrically overlap, plus a thin
   decorative Skia overlay tracing the *true* union silhouette as a stroke + soft
   light sheen (cosmetic only, didn't touch the blur). Along the way this surfaced
   two real bugs, worth remembering even though the approach itself got dropped:
   overlapping two independent BlurViews compounds their blur where they overlap
   (visible seam), and Skia's web `Canvas` ignores `pointerEvents` as a *prop* (must
   be `style.pointerEvents` on a flat object — a style *array* crashes it outright).
   Fixed both, then sized the raised bump up further to make it the obvious focal
   point.
4. **User called it: "gw g suka lagi navbarnya, udahlah balik ke awal aja yang flat
   sejajar kayaknya much better"** (don't like the navbar anymore, just go back to
   the flat/aligned original, it's much better). Reverted to the single-flat-pill
   layout from the very first navbar implementation (all `RAISED_*`
   constants/files/components deleted), while **keeping** the parts of the later
   work that were genuinely separate improvements and still apply to a flat bar:
   - the wavy liquid-surface fill (`LiquidFill.tsx`, reused from Recap's glass
     bands) instead of a flat cross-fade, still synced to the paint-spill pour via
     `spillRequest`/`fillProgress`
   - the locks-solid-once-full fix (the wave's oscillation otherwise left a gap at
     the top even at 100% fill)
   - the stronger blur intensity (72) / lower tint opacity (0.22) tuning, so the
     glass effect stays visible once a mood tint sits on top

Lesson for next time: the raised/merged-bump concept was tried three different ways
and none of them beat the original flat pill. Don't relitigate that specific
direction without a concrete new reason.

## The paint-spill / pour animation

`src/features/checkin/PaintSpill.tsx` + `PourStream.tsx` + `pourPath.ts` — tapping a
mood blob doesn't just log it, it pours a continuous liquid stream (not a single
traveling drop, not a fullscreen cover) from the blob's actual measured screen
position down into the navbar, timed to finish exactly as the navbar's own fill
animation completes (`SPILL_TRAVEL_MS`, shared constant, currently 620ms).

Notable fixes from this session:
- The ribbon originally used straight `lineTo` segments at a high wobble frequency,
  which read as a felt-tip marker line rather than liquid — rebuilt with
  quad-through-midpoint curve smoothing and gentler wobble.
- Width now tapers from the tapped blob's own size down to the navbar bar's own
  height, big-to-small toward the destination (was backwards before — bigger at
  the target end, which floated past what it was pouring into). Target point
  simply follows the flat bar's own center now (`TAB_BAR_HEIGHT`-based), no
  separate raised-button geometry to account for anymore.
- The pour's origin now comes from the blob's *measured* on-screen center
  (`View.measure()`), not the raw tap coordinate — an off-center tap used to leave
  a visible gap between the blob and the stream's tail. A matching tail-cap circle
  (mirroring the existing head-cap circle at the target end) closes that gap
  regardless of where within the blob you tap.

## Known constraints / gotchas worth remembering

- **`experiments.reactCompiler` must stay `false` in `app.json`.** With it on, a
  multi-stage `withSequence` on the spill timeline silently stops advancing after
  the first stage. Documented in code comments; don't re-enable without retesting
  this specific case.
- **Skia on web needs `WithSkiaWeb`** (see `skiaWebOpts.ts` + every `*Lazy.web.tsx`
  file) to defer evaluating Skia-importing modules until CanvasKit's WASM has
  loaded — importing Skia eagerly on web breaks `Skia.Path.Make()` calls. Every
  Skia component in this app has a `.native.tsx` (trivial re-export) /
  `.web.tsx` (WithSkiaWeb-wrapped) split; follow that pattern for new ones.
- **Skia can't mask a real `BlurView` to an arbitrary shape.** Only simple
  rect/rounded-rect clipping via `overflow:'hidden'` + `borderRadius` is available
  for real blur. Anything that needs an arbitrary/organic silhouette *and* real
  blur has to be built as overlapping simple-clipped BlurView pieces plus a
  cosmetic Skia overlay on top — not a single Skia-masked blur.
- **`pointerEvents` on Skia's web `Canvas`** must be set via `style.pointerEvents`
  on a flat object, never as a prop, never inside a style array.
- Web preview verification in this environment has significant per-tool-call
  latency (multiple seconds per `preview_click`/`preview_screenshot`/`preview_eval`
  round-trip) — when verifying slow/debug-speed animations, budget for this or
  you'll consistently sample past the point you intended.

## Not started / explicitly out of scope for Phase 1

- Supabase wiring (schema drafted in `supabase/migrations/`, RLS policies written,
  client scaffolded in `src/lib/supabase.ts` — none of it connected to the app yet)
- Settings page, circle management UI (adding/accepting friends, cap of 10, mutual-add)
- Push notifications, streaks, gesture response, close-friend tier, contact sync
- Any real auth — `userId: 'me'` is hardcoded in the mock store

## Suggested next conversation topics

- Whether to start Supabase wiring now (auth + real persistence) or keep refining
  the 3-screen UI/animation feel first
- Circle management UI/UX (currently doesn't exist at all — sharing toggle assumes
  a circle already exists)
- Whether the current mock data (`src/features/mood/mockData.ts`) still makes sense
  once real accounts exist, or should be replaced/removed
