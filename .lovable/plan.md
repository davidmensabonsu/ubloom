## Why a new user hits "Unauthorized" on the Ubi routine flow

The "Unauthorized" string is **literally the response body** that `supabase/functions/_shared/auth.ts → requireUser()` returns when it can't validate the caller's JWT. The client (`useUbiChat.ts`) renders `err.error` straight into the chat bubble, so any 401 from `ubi-chat` shows up as the assistant saying "Unauthorized".

For a brand-new user, the most likely causes — in order of probability:

### 1. They aren't actually signed in yet (email confirmation flow)
We do **not** auto-confirm email signups. A user who signs up with email/password is created in `auth.users` but has no session until they click the confirmation link. If they manage to navigate to `/ubi` without a session (e.g., via cached route or back button), `supabase.auth.getSession()` returns `null`, `accessToken` is empty, and:
- In `UbiOnboarding.tsx` (line 158) the code throws "Not authenticated" — surfaced as a toast/error.
- In `useUbiChat.ts` (line 449) the code returns "You need to be signed in to chat with Ubi."
- BUT if the session exists locally yet is **stale/expired** and auto-refresh hasn't run, the token is sent, the edge function calls `auth.getUser(token)`, GoTrue rejects it, and we return `{"error":"Unauthorized"}` — which is what the user is seeing.

### 2. Premium-derived state isn't the cause, but worth flagging
The `handle_new_user` trigger inserts `subscribers` with `plan='free', status='inactive'`. Server-side in `ubi-chat`, `isPremium` is derived from `plan !== 'free' AND status IN (active, trialing)` — so a new user in their **in-app 3-day free trial** is treated as NOT premium by the edge function, even though the client says `isActive=true, isTrial=true`. This wouldn't produce "Unauthorized", but it would mean a new trial user clicking "Plan today" gets the "upgrade to Premium" message instead of an actual routine plan. Worth fixing alongside.

### 3. Conversation ownership check (less likely)
If a stale `conversationId` from a previous user in local storage is sent, `ubi-chat` returns `403 "Forbidden"` — not "Unauthorized" — so this is probably not it, but the zustand store does persist `currentConversationId`.

## Proposed fixes

### A. Make the 401 path self-healing (highest impact)
In `useUbiChat.ts` and `UbiOnboarding.tsx`, before calling the edge function:
1. Call `supabase.auth.getSession()` — if `expires_at` is past or within 60s, call `supabase.auth.refreshSession()` first.
2. If still no valid `access_token`, route the user to `/auth` with a friendly toast instead of POSTing with no/expired JWT.
3. If the edge function does respond 401, treat it as a session-recovery moment: refresh once and retry; if still 401, sign-out and redirect to `/auth`.

### B. Treat the in-app free trial as premium server-side
Update the server-side `isPremium` derivation in `supabase/functions/ubi-chat/index.ts` to also honour the in-app trial window:
```ts
const trialActive = sub?.trial_started_at &&
  (Date.now() - new Date(sub.trial_started_at).getTime()) < TRIAL_DAYS * 86_400_000;
isPremium = trialActive || (sub.plan !== 'free' && ['active','trialing'].includes(sub.status));
```
This matches the client's `isActive` logic and lets newly-signed-up trial users actually receive a `<routine_plan>` JSON block.

### C. Defensive cleanup
- Clear any persisted `currentConversationId` on `SIGNED_IN` / user-id change in the zustand store, so a new user never inherits a previous user's conversation id.

## Files to touch
- `src/hooks/useUbiChat.ts` — refresh-then-retry, friendlier auth error, clear convoId on user change.
- `src/components/ubi/UbiOnboarding.tsx` — same refresh-then-retry guard.
- `supabase/functions/ubi-chat/index.ts` — include in-app trial window in `isPremium`.
- `src/stores/userStore.ts` — reset `currentConversationId` when `user.id` changes (only if it's persisted there; will confirm during implementation).

## A couple of things I'd like to confirm before building
1. Did the user sign up with **email/password** or **Google**? (Changes whether root cause is "no session yet" vs "expired token".)
2. Did they see the literal word "Unauthorized" as an Ubi reply bubble, or as a toast/error overlay? (Confirms it came from `ubi-chat` vs the client guard.)