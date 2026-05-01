
## What we're building

1. **Legal pages** — `/terms` and `/privacy` routes with draft content tailored to uBloom's actual data collection
2. **Signup consent** — checkbox on the Auth sign-up form linking to Terms and Privacy Policy
3. **Delete my account** — button on Profile that wipes all user data from the database, cancels any active Stripe subscription, and deletes the auth account

---

## 1. Legal pages

Create two new page components:

- **`src/pages/Terms.tsx`** — Terms and Conditions covering: app purpose (wellness/self-growth, not medical advice), user-generated content, AI disclaimer (Ubi mentor is not a therapist), subscription/billing terms, account termination.
- **`src/pages/Privacy.tsx`** — Privacy Policy covering: data collected (mood logs, journal entries, habits, cycle data, AI chat history, vision board images, profile info), Stripe billing data, analytics events, cookies/local storage, data retention, GDPR rights (access, erasure, portability), contact details placeholder for the solicitor to fill in.

Both pages will use the app's existing glass-card styling and be publicly accessible (no auth required). Routes added to `App.tsx`.

A footer link to both pages will be added to the Auth page so users can review them before signing up.

## 2. Signup consent checkbox

On the Auth sign-up form, add a required checkbox: "I agree to the Terms and Conditions and Privacy Policy" with inline links. The sign-up button will be disabled until checked. Login form is unaffected.

## 3. Delete my account (Profile page)

Add a "Delete my account" section below the existing "Reset all data" button on Profile:

- Confirmation dialog explaining the action is permanent and listing what will be deleted
- Requires typing "DELETE" to confirm
- On confirm, calls a new **`delete-account`** edge function that:
  1. Authenticates the user via JWT
  2. Cancels any active Stripe subscription (looks up customer by email)
  3. Deletes rows from: `user_data`, `profiles`, `ubi_messages`, `ubi_conversations`, `ubi_memory`, `ubi_ratings`, `analytics_events`, `subscriber_events`, `subscribers` (all where `user_id` matches)
  4. Deletes files from `vision-images` and `voice-journals` storage buckets
  5. Deletes the auth user via `supabase.auth.admin.deleteUser()`
  6. Returns success
- Frontend signs the user out and redirects to `/` on success

## 4. Database migration

A migration to add a service-role INSERT policy on `subscriber_events` (needed for the delete-account function to log the cancellation if desired) is not required since the edge function uses the service role key directly.

## 5. Edge function config

Add `[functions.delete-account]` with `verify_jwt = false` to `supabase/config.toml` (JWT validated in code as per project pattern).

---

### Files to create
- `src/pages/Terms.tsx`
- `src/pages/Privacy.tsx`
- `supabase/functions/delete-account/index.ts`

### Files to edit
- `src/App.tsx` — add `/terms` and `/privacy` routes (public)
- `src/pages/Auth.tsx` — add consent checkbox + legal links on sign-up
- `src/pages/Profile.tsx` — add "Delete my account" button + confirmation dialog
- `supabase/config.toml` — add delete-account function config
