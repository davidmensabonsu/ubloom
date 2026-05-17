## Why Ubi thinks you're not on Premium

The chat edge function decides whether to build the routine based on a single field, `userContext.isPremium`, that the client passes in. That flag is computed inside `buildUserContext` in `src/hooks/useUbiChat.ts` (lines 67–82) with this logic:

```ts
const { data: sub } = await supabase
  .from('subscribers')
  .select('status')
  .eq('user_id', userId)
  .maybeSingle();
isPremium = sub?.status === 'active';
isTrial   = sub?.status === 'trial';   // wrong string — Stripe uses "trialing"
```

This is the only premium signal Ubi ever sees, and it has four problems that all converge on "false":

1. It re-queries `subscribers` on every send instead of using the already-loaded `useSubscription()` state the rest of the app trusts. If the query is slow, blocked by a stale session, or the row hasn't been re-read yet after a webhook, the result is `null` and the user is treated as free.
2. It checks `status === 'trial'`, but the actual status value persisted from Stripe is `'trialing'` — so anyone on a real Stripe trial is also misclassified.
3. It ignores `isAdmin`, even though admins are treated as premium everywhere else.
4. It ignores the in-app 3-day trial driven by `profile.trialStartedAt`, which `useSubscription` already resolves into `isActive`.

Meanwhile the rest of the app gates Premium correctly through `useSubscription()` — for example `src/pages/Ubi.tsx:201` uses `isActive` (admin + Stripe active + Stripe trialing + in-app trial) for the "approve plan" gate. So the UI sees you as Premium, but the edge function sees you as free, and Ubi follows its system prompt and refuses to emit the `<routine_plan>` JSON block. That's why the conversation looks complete but the routine never gets built.

(For confirmation: your `subscribers` row is `plan='premium', status='active'` — so the higher-level hook resolves correctly, only the duplicated logic inside `buildUserContext` is wrong.)

## Fix

Make the chat hook use the single source of truth instead of re-querying.

### `src/hooks/useUbiChat.ts`
- Remove the inline `subscribers` query in `buildUserContext` (lines 67–82).
- Accept `isPremium` and `isTrial` as arguments to `buildUserContext`.
- In the `useUbiChat` hook, read `isActive`, `isPremium`, `isTrial` from `useSubscription()` and pass them through to every `buildUserContext` call (there is one call site around line 404).
- Map them as: `isPremium = isActive` (treat admin, Stripe paid, Stripe trialing, and in-app trial all as premium for the planner) and keep `isTrial` for telemetry only.

### Verification
- Open Ubi, tap "Plan my routine", walk through the 5 questions, confirm the `<routine_plan>` block appears and "Looks good, add to my routine" writes tasks to the Routine page.
- Spot-check the edge function logs (`ubi-chat`) to confirm `userContext.isPremium` is `true` for your user on the next send.

### Out of scope
- No changes to `subscribers`, RLS, Stripe, or `useSubscription` itself.
- No changes to the system prompt or to the planning UX — only the premium signal feeding it.
