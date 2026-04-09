

## Subscription System with 3-Day Free Trial

### Overview

Users get a 3-day free trial with full access. After it expires, they enter a "free tier" where features are restricted but still visible (locked with upgrade prompts). Paid subscribers (£4.99/month or £45/year) get full access.

### Architecture

**Stripe integration** handles payments. A `useSubscription` hook centralizes subscription state across the app. Restricted features show a blurred/locked overlay with an "Unlock" button instead of being hidden.

### What gets built

**1. Enable Stripe & create products**
- Enable Stripe integration via Lovable's built-in connector
- Create two Stripe products: £4.99/month and £45/year
- Set up a 3-day free trial on both

**2. Database: subscription tracking**
- Add a `subscriptions` table to track user subscription status, trial start/end, and Stripe customer/subscription IDs
- On signup, automatically create a row with `trial_ends_at = now() + 3 days`
- RLS: users can only read their own subscription row

**3. `useSubscription` hook**
- Returns `{ status, isActive, isTrial, trialDaysLeft, canUse(feature) }`
- Status: `'trial'` | `'active'` | `'expired'` | `'canceled'`
- `canUse(feature)` checks per-feature limits for free tier users
- Tracks daily Ubi message count in localStorage

**4. Feature restrictions (free tier after trial)**

| Feature | Free tier limit | How it looks |
|---|---|---|
| Ubi chat | 5 messages/day | Counter badge; after 5, input disabled with upgrade prompt |
| Ubi Insights (Health) | Hidden behind blur | Blurred card with lock icon overlay |
| Mood Trends (Reflect) | Hidden behind blur | Blurred chart with lock icon overlay |
| Wonder resources | 3 per category | After 3, remaining cards show with lock overlay |
| Today's Cycle Insight | Full access | No restriction |
| Routine, Journal, Home | Full access | No restriction |

**5. `LockedOverlay` component**
- Reusable component that wraps any restricted content
- Shows a frosted-glass blur with a lock icon and "Unlock with uBloom Pro" button
- Tapping the button navigates to the paywall page

**6. Paywall page (`/upgrade`)**
- Beautiful full-screen page with uBloom branding
- Shows both plans side by side (monthly vs yearly with savings badge)
- Lists what's included: unlimited Ubi, full personalization, all resources, mood insights, Ubi health insights
- "Start free trial" / "Subscribe" buttons trigger Stripe checkout
- Accessible from locked overlays, profile page, and a subtle banner on the home page

**7. Profile page integration**
- Show current plan status (trial with days remaining, active plan, or expired)
- "Manage Subscription" button for active subscribers (Stripe portal)
- "Upgrade" button for expired trial users

**8. Stripe webhook edge function**
- Handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Updates the `subscriptions` table accordingly

**9. Trial banner**
- During trial: subtle dismissible banner on home page showing "X days left in your free trial"
- After expiry: persistent banner "Your trial has ended — Upgrade to keep full access"

### Visual design approach

- Locked content uses a CSS `backdrop-blur` with 60% opacity overlay, keeping the content visible but inaccessible
- Lock icon centered on the overlay with a soft gradient background matching the app theme
- Upgrade buttons use the primary accent color with rounded-full styling
- Paywall page uses the existing gradient-background with a card-based layout
- Trial countdown uses a warm amber badge style

### File changes summary

- **New files**: `src/hooks/useSubscription.ts`, `src/components/LockedOverlay.tsx`, `src/components/TrialBanner.tsx`, `src/pages/Upgrade.tsx`, `supabase/functions/stripe-webhook/index.ts`
- **Modified files**: `src/pages/Ubi.tsx` (message limit), `src/pages/Health.tsx` (lock insights), `src/pages/Alignment.tsx` (lock mood trends), `src/pages/Wander.tsx` + `src/pages/WanderCategory.tsx` (resource limits), `src/pages/Profile.tsx` (plan status), `src/pages/Home.tsx` (trial banner), `src/App.tsx` (add /upgrade route), `src/stores/userStore.ts` (subscription fields), `src/hooks/useUbiChat.ts` (message counting)
- **New migration**: `subscriptions` table with RLS

