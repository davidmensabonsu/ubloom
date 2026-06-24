Your message cut off after "tell me" — I'll default to a broad read-only audit. Approve and I'll run it; reply with a narrower scope if you want me to focus.

## What I'll audit (no code changes)

1. **Auth configuration**
   - Email confirmation / auto-confirm
   - Password min length, HIBP leaked-password check, any complexity rules
   - OAuth providers enabled (Google, Apple, etc.) and redirect URLs
   - Session/JWT settings, password reset redirect
   - Anonymous sign-ups

2. **Database & RLS**
   - All `public.*` tables: columns, RLS enabled?, policies, GRANTs
   - `user_roles` setup and `has_role` usage (privilege-escalation check)
   - SECURITY DEFINER functions and `search_path`
   - Triggers (e.g. `handle_new_user`, `protect_trial_started_at`, username validation)
   - Run `supabase--linter` and `security--run_security_scan`

3. **Storage buckets**
   - `vision-images`, `voice-journals`, `video-journals`, `routine-icons` — public flag, policies, expected access pattern

4. **Edge functions**
   - List of functions, which have `verify_jwt = false` in `config.toml` and whether each justifies it
   - Auth handling (Authorization header vs query token, e.g. `widget-svg`)
   - Secrets each function depends on (Stripe, Lovable AI, Supabase service role)
   - Any function exposing service-role key paths to unauthenticated callers

5. **Client-side**
   - `src/integrations/supabase/client.ts` usage, localStorage session storage
   - `useAuth`, `ProtectedRoute`, route guards
   - Any role/admin checks done client-side only
   - Password rules in `Auth.tsx` / `ResetPassword.tsx` vs. backend rules

6. **Secrets inventory**
   - Cross-check stored secrets against what functions actually use; flag unused or duplicated entries (e.g. `SUPABASE_PUBLISHABLE_KEY` vs `SUPABASE_PUBLISHABLE_KEYS`)

## Deliverable

A single written report grouped by the sections above, with concrete findings (file:line where relevant), severity tags (info / warning / critical), and recommended fixes — but **no file edits or backend changes** will be made. You decide what to act on afterward.

## Out of scope unless you say otherwise

- Performance / query tuning
- UX or design review
- Bundle size / build config
- Dependency CVE scan
