## Why Ubi treats you as free

Your account (`leydm19@…`) has:
- `user_roles.role = 'admin'`
- `subscribers.plan = 'free'`, `status = 'inactive'`
- `trial_started_at = 2026-04-17` (in-app 3-day trial expired ~2 months ago)
- No Stripe subscription

The **client** (`useSubscription`) treats admins as premium:
```ts
if (isAdmin || stripeSubscribed) return 'active';
```
…so the UI shows you as premium and lets you tap "Plan today / tomorrow".

But the **edge function** (`supabase/functions/ubi-chat/index.ts`, lines 47-64) re-derives `isPremium` purely from the `subscribers` row + trial window — it never checks `user_roles`. For you, that resolves to `false`, so Ubi follows the FREE-tier branch of the system prompt and refuses to emit the `<routine_plan>` JSON, replying with the "upgrade to Premium" line instead.

The same gap exists in every other premium-gated edge function (`health-insights`, `podcast-recommendation`, `wonder-recommendations`, `generate-home-messages`) — none of them honor admin.

## Fix

Add a small shared helper and reuse it everywhere we derive premium server-side.

### 1. `supabase/functions/_shared/premium.ts` (new)
Single source of truth: returns `true` if the user is an admin OR has an active paid sub OR is inside the 3-day in-app trial.

```ts
export async function isPremiumUser(admin, userId): Promise<boolean> {
  // admin override
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  if (roleRow) return true;

  const { data: sub } = await admin
    .from('subscribers')
    .select('plan, status, trial_started_at')
    .eq('user_id', userId)
    .maybeSingle();

  const paidActive = !!(sub?.plan && sub.plan !== 'free' &&
    (sub.status === 'active' || sub.status === 'trialing'));
  const TRIAL_DAYS = 3;
  const trialActive = !!(sub?.trial_started_at &&
    Date.now() - new Date(sub.trial_started_at).getTime() < TRIAL_DAYS * 86_400_000);
  return paidActive || trialActive;
}
```

### 2. Replace the inline derivation in `ubi-chat/index.ts` with `isPremium = await isPremiumUser(admin, verifiedUserId);`

### 3. Apply the same helper in the other premium-gated functions so admins (and future trial logic changes) stay consistent:
- `health-insights/index.ts`
- `podcast-recommendation/index.ts`
- `wonder-recommendations/index.ts`
- `generate-home-messages/index.ts`

(If any of those don't currently gate on premium server-side, I'll leave them untouched and only fix the ones that do.)

### 4. No client changes
The client already treats admin as active — that's correct and stays as-is.

## Files touched
- `supabase/functions/_shared/premium.ts` (new)
- `supabase/functions/ubi-chat/index.ts`
- `supabase/functions/health-insights/index.ts` *(if it gates)*
- `supabase/functions/podcast-recommendation/index.ts` *(if it gates)*
- `supabase/functions/wonder-recommendations/index.ts` *(if it gates)*
- `supabase/functions/generate-home-messages/index.ts` *(if it gates)*

No DB migrations, no schema changes, no client changes.