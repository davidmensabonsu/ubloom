

## Analysis

The Supabase client is already configured with `persistSession: true` and `autoRefreshToken: true`, so sessions persist in localStorage across browser restarts. The Welcome page already auto-redirects authenticated users to `/home`.

The issue is that the app's landing route (`/`) is the Welcome page, which always renders first (even briefly) before redirecting. Users see the Welcome screen every time they open the app, even though they're already signed in.

## Plan

**Modify the Welcome page (`src/pages/Welcome.tsx`)** to skip rendering the welcome UI entirely when the user is already authenticated:

1. While `loading` is true, show a minimal loading spinner (same as ProtectedRoute) instead of the full Welcome page content.
2. Once loading resolves and `user` exists, redirect immediately (already works via the useEffect).
3. Only render the full Welcome UI (logo, tagline, CTA button) when loading is done AND there is no user.

This is a single-file change — the redirect logic already exists, we just need to avoid showing the Welcome content while auth state is being resolved.

