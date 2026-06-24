## Goal
Stop embedding the user's full Supabase JWT in the widget URL. Replace it with an opaque, rotatable, short-lived widget token bound to one user.

## 1. Database — new migration

Create `public.widget_tokens`:

| column | type | notes |
|---|---|---|
| `token` | `text` PK | url-safe random (32 bytes base64url), generated server-side |
| `user_id` | `uuid` not null, FK → `auth.users` on delete cascade | one-to-one logical (unique) |
| `created_at` | `timestamptz` default `now()` |
| `expires_at` | `timestamptz` not null | default `now() + interval '30 days'` |
| `last_used_at` | `timestamptz` | bumped by the edge function |

- Unique index on `user_id` (one active token per user — rotation replaces in place via upsert).
- GRANTs: `SELECT, INSERT, UPDATE, DELETE` to `authenticated` (so the rotate helper can upsert via authed client) and `ALL` to `service_role`. **No `anon` grant.**
- RLS enabled. Policies (all `authenticated`):
  - SELECT / INSERT / UPDATE / DELETE where `auth.uid() = user_id`.
- Helper SQL function `public.rotate_widget_token()` returns `text`, SECURITY DEFINER, `search_path = public`:
  - Generates `encode(gen_random_bytes(32), 'base64')` (stripped to url-safe), upserts the row for `auth.uid()` with `expires_at = now() + interval '30 days'`, returns the token. Grant EXECUTE to `authenticated` only.

## 2. New edge function — `supabase/functions/routine-widget/index.ts`

Purpose: replaces the auth path of `widget-svg` but keyed on the widget token instead of the session JWT.

- Accept `?token=<widget_token>` (also Authorization header for symmetry, optional).
- Use `service_role` client to:
  1. `select user_id, expires_at from widget_tokens where token = $1`
  2. Reject if missing or `expires_at < now()`.
  3. Update `last_used_at = now()`.
- Load `coreHabits` + `habitCompletions` from `user_data.data` for that `user_id`.
- Render the SVG using the exact same `renderRoutine` / `renderFallback` / `calcStreak` logic currently in `widget-svg/index.ts` (copy, don't refactor — keeps blast radius small).
- Cache-Control: `no-cache`. CORS open (image endpoint).
- Returns the fallback SVG (never an error JSON) on any failure, same as today.

Note: this lives alongside the existing `widget-svg` function. We don't delete `widget-svg` in this migration — old installed widgets keep working until users open Routine again. Phase 2 (separate request) can remove `widget-svg` once analytics show no traffic.

## 3. New helper — `src/lib/enableRoutineWidget.ts`

Single export, used by `Routine.tsx`:

```text
enableRoutineWidget(enabled: boolean): Promise<void>
- if !isDespiaNative() → no-op
- if enabled:
    - call supabase.rpc('rotate_widget_token') → token
    - build url = `${VITE_SUPABASE_URL}/functions/v1/routine-widget?token=${token}`
    - window.despia = `widget://?url=${encodeURIComponent(url)}&size=medium`
- if !enabled:
    - window.despia = 'widget://remove'
    - (optional) supabase.from('widget_tokens').delete().eq('user_id', uid)
```

Also export `refreshRoutineWidget()` (called on Routine mount / focus) that does the same rotate + push without flipping the toggle state — keeps widget fresh and reduces token lifetime exposure.

## 4. Wire-up in `src/pages/Routine.tsx`

- Remove the inline `widgetToken` / `widgetUrl` state and the `data.session.access_token` read on line 47.
- Remove the inline `handleWidgetToggle` body; replace with `onCheckedChange={(v) => { setWidgetEnabled(v); enableRoutineWidget(v); }}`.
- Replace the `useEffect` on line 150–153 with `useEffect(() => { refreshRoutineWidget(); }, [])`.
- Persist `widgetEnabled` preference in the user store (small `widgetEnabled: boolean` flag in `profile`) so the toggle reflects the actual state across sessions. (One-line addition to `userStore.ts` + persist.)

## 5. Store note (no field renames)

Confirmed from the audit: keep using `profile.coreHabits` and `profile.habitCompletions`. Streak stays computed (no new field). Only addition is `profile.widgetEnabled: boolean` (default `false`).

## 6. What we explicitly do NOT change

- `supabase/config.toml` — `routine-widget` will deploy with default `verify_jwt = false` (we validate the widget token in code). No config edit needed.
- Existing `widget-svg` function — left in place for backwards compat.
- Other edge functions, RLS policies, or unrelated UI.

## 7. Validation after build

1. Run the migration; confirm `\d public.widget_tokens` + policies + GRANTs.
2. Hit `routine-widget?token=…` from curl with a freshly-rotated token → expect SVG.
3. Hit it with a random/expired token → expect fallback SVG, no 500.
4. In the app, toggle the widget off and back on; confirm no JWT appears in the URL passed to `window.despia` (console-log the URL during the verify step, then remove).

## Open assumption

I'm defaulting the widget token TTL to **30 days** and auto-refreshing on every Routine page open. Say so if you'd prefer a shorter TTL (e.g. 7 days) or no auto-rotate.
