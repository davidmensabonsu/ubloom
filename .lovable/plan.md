

## Problem

`ProtectedRoute` only checks authentication — it doesn't check whether onboarding is complete. So after signup, the user lands on `/home` with `onboardingComplete: false`. The onboarding redirect only happens on the Welcome page, which the user bypasses after auth.

## Solution

Update `ProtectedRoute` to redirect unauthenticated users to `/auth` (existing) AND redirect authenticated users who haven't completed onboarding to `/onboarding` — except when they're already on an onboarding-flow route (`/onboarding`, `/dream-life`, `/choose-aesthetic`).

### Changes

**`src/components/ProtectedRoute.tsx`**:
- Import `useUserStore` and `useLocation`
- After confirming the user is authenticated, check `profile.onboardingComplete`
- If `false` and the current path is not `/onboarding`, `/dream-life`, or `/choose-aesthetic`, redirect to `/onboarding`

This is a single-file change (~5 lines of logic added). No database or backend changes needed.

