

## Auto-Login: Skip Welcome/Auth for Returning Users

### Problem
The app already persists sessions (Supabase stores tokens in localStorage with `autoRefreshToken: true`), so users don't actually need to re-authenticate. The issue is that the Welcome page (`/`) doesn't auto-redirect logged-in users -- they have to manually click the button every time.

### Plan

**1. Auto-redirect on Welcome page (`src/pages/Welcome.tsx`)**
- Add a `useEffect` that watches `user` and `loading` from `useAuth()`
- When `loading` is false and `user` exists, automatically navigate to `/home` (or `/onboarding` if onboarding isn't complete)
- Show a brief loading state while checking auth status

**2. Auto-redirect on Auth page (`src/pages/Auth.tsx`)**
- Add a `useEffect` that redirects authenticated users away from `/auth` to `/home`
- Prevents logged-in users from seeing the sign-in form

Both changes are small -- just adding a `useEffect` with early redirect logic to each page. No backend changes needed since session persistence is already working correctly.

