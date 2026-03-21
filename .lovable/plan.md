

## Monetisation Plan: £4.99/month or £45/year with 3-day trial

### Overview
Add a Stripe-powered subscription with two pricing tiers (monthly and yearly) and a 3-day free trial. All new users get full access during the trial; after it expires, they hit a paywall. Existing users will also need to subscribe.

### How it works for users
1. User signs up and completes onboarding as normal — full access for 3 days
2. After 3 days (or anytime), they see a subscription screen with two options
3. They pick monthly (£4.99) or yearly (£45), enter payment via Stripe Checkout
4. On success, they continue using the app; on cancellation/expiry, they hit the paywall again
5. Users can manage their subscription from the Profile page

### Technical approach

**1. Enable Stripe integration**
- Use the Lovable Stripe tooling to set up products and prices (£4.99/month GBP, £45/year GBP, both with 3-day trial)

**2. Database: `subscriptions` table**
- Columns: `id`, `user_id`, `stripe_customer_id`, `stripe_subscription_id`, `status` (trialing/active/canceled/past_due), `current_period_end`, `trial_end`, `created_at`, `updated_at`
- RLS: users can only read their own row
- Populated/updated via Stripe webhooks

**3. Edge function: `create-checkout`**
- Accepts `price_id` and user info
- Creates or retrieves Stripe customer, creates a Checkout Session with the 3-day trial, returns the checkout URL

**4. Edge function: `stripe-webhook`**
- Handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Upserts into `subscriptions` table

**5. Edge function: `create-portal-session`**
- Creates a Stripe Customer Portal session so users can manage/cancel their subscription

**6. Frontend: Subscription gate**
- New `useSubscription` hook that queries the `subscriptions` table for the current user's status
- New `SubscriptionGate` component wrapping protected routes — if no active/trialing subscription, redirect to a paywall page
- New `/subscribe` paywall page with the two pricing cards (monthly/yearly), styled to match the app aesthetic
- "Manage subscription" button on the Profile page linking to the Stripe Customer Portal

**7. Flow**
- New users: sign up → onboarding → 3-day trial starts automatically at first Stripe checkout (or we auto-create a trial subscription on signup)
- Returning users without subscription: redirected to `/subscribe`
- Active subscribers: normal app access

### Files to create/modify
- **New**: `src/hooks/useSubscription.ts`, `src/pages/Subscribe.tsx`, `src/components/SubscriptionGate.tsx`
- **New edge functions**: `create-checkout`, `stripe-webhook`, `create-portal-session`
- **New migration**: `subscriptions` table
- **Modified**: `src/App.tsx` (add route + gate), `src/pages/Profile.tsx` (manage subscription button), `src/components/ProtectedRoute.tsx` (integrate subscription check)

