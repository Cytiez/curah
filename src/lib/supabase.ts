import { createClient } from '@supabase/supabase-js';

/**
 * Phase 2 scaffold — not imported by any screen yet (Fase 1 runs on mock
 * data per the approved plan). Documents the intended client shape so
 * wiring it up later is a drop-in.
 *
 * Before this is actually used:
 * - Add `react-native-url-polyfill` (import it once, e.g. at the top of
 *   this file) and `@react-native-async-storage/async-storage` for session
 *   persistence — both are required by @supabase/supabase-js on React
 *   Native but are omitted here since nothing calls this yet.
 * - Copy .env.example to .env and fill in the two EXPO_PUBLIC_ vars from
 *   the Supabase project settings. Never put the service role key here or
 *   in any other client-bundled code — see supabase/migrations for the RLS
 *   policies that make the anon key safe to ship.
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.',
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
