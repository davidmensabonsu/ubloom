## Goal
Add a unique `@username` to signup (for the future social network feature) while keeping the personal first name collected later in Onboarding for greetings.

## 1. Database

Add a `username` column to `profiles`, enforce uniqueness case-insensitively, and add a public lookup so the signup form can check availability before submit.

Migration:
- `ALTER TABLE public.profiles ADD COLUMN username text;`
- Validation trigger on insert/update: reject if username is set but does not match `^[a-zA-Z0-9._]{3,30}$`, or starts/ends with `.`, or contains `..`.
- `CREATE UNIQUE INDEX profiles_username_lower_unique ON public.profiles (lower(username));` — case-insensitive uniqueness.
- `CREATE INDEX profiles_username_lower_idx ON public.profiles (lower(username));` for fast search later.
- New RPC `public.username_available(_username text) RETURNS boolean` — `SECURITY DEFINER`, `STABLE`, fixed `search_path = public`. Validates the format and returns `false` if anyone already owns it (case-insensitive). Granted `EXECUTE` to `anon` and `authenticated` so the signup form can call it before the user is logged in. Does NOT expose any other profile fields.
- Update `handle_new_user()` trigger: read `NEW.raw_user_meta_data->>'username'` and insert it into `profiles.username` alongside the existing `display_name` logic. If a duplicate slips through (race condition), the unique index throws and signup fails cleanly.
- Do NOT backfill existing rows — `username` stays nullable so existing accounts aren't broken. (Profile page will let them set one later — see step 4.)

## 2. Signup form (`src/pages/Auth.tsx`)

- Replace the existing "Display name" input with a "Username" input prefixed with `@`.
- Local validation (zod): `^[a-zA-Z0-9._]+$`, 3–30 chars, no leading/trailing `.`, no `..`.
- Debounced availability check (~400 ms) calling `supabase.rpc('username_available', { _username })`. Show inline state: checking / available / taken / invalid. Disable the Sign-up button until the username is `available`, email/password are valid, and terms are agreed.
- On submit, pass the username (lowercased and trimmed) to `signUp` so it lands in `auth.users.raw_user_meta_data.username` and the trigger writes it to `profiles.username`. If the server still rejects (race), surface a friendly "That username was just taken — try another."
- Keep the existing terms checkbox and toggle behaviour.

## 3. Auth hook (`src/hooks/useAuth.tsx`)

- Extend `signUp(email, password, username)` to send `options.data: { username }` (the trigger will pick it up). Display name continues to be set later in Onboarding, so no `display_name` is passed at signup.

## 4. Profile page (`src/pages/Profile.tsx`)

- Show the username as `@username` near the top, read-only for now.
- If the current user has no username yet (legacy account), show a small inline form letting them claim one — same validation + availability check used on signup, then `update profiles set username = …`.
- Keep the existing display name field unchanged (still used for greetings).

## 5. Onboarding (`src/pages/Onboarding.tsx`)

- No changes. Still collects the personal first name into `profiles.display_name`.

## Out of scope
- The actual social network search/feature (this only lays the schema + signup foundation).
- Username changes after claim (will need a separate flow with rate-limiting and reserved-name list once the social feature is built).
- Reserved/blocklist of usernames — can be added later before launching the social feature.