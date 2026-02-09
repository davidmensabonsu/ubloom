
# Profile Page (Bottom Nav)

## Overview
Add a "Profile" page as a full tab in the bottom navigation bar, alongside Home, Align, Routine, Goals, and Dream. No changes to the Home page.

## Navigation Change
- Replace one nav slot or add a 6th tab in `BottomNav.tsx`
- New tab: **Profile** with a `User` icon, route `/profile`
- Position: last item (rightmost)

## Profile Page Sections

### Account Info
- Avatar display/upload (using existing `vision-images` storage bucket, stored in `profiles.avatar_url`)
- Editable display name (synced to `profiles` table)
- Email (read-only, from auth)

### App Preferences
- Theme/aesthetic picker reusing the aesthetic options from `ChooseAesthetic.tsx` (extracted into a shared constant)

### Account Actions
- Sign out button
- "Reset data" danger zone (clears Zustand store + `user_data` row)

## Technical Details

### New Files
- **`src/pages/Profile.tsx`** -- Settings page with avatar upload, display name editing, theme picker, sign out, and reset data

### Modified Files
- **`src/components/BottomNav.tsx`** -- Add Profile tab (`/profile`, `User` icon) as the 6th nav item
- **`src/App.tsx`** -- Add `/profile` route wrapped in `ProtectedRoute`

### Data Flow
- Display name reads/writes to `profiles` table via Supabase client
- Avatar uploads to `vision-images/{user_id}/avatar.{ext}`, URL saved to `profiles.avatar_url`
- Theme selection uses existing `setAesthetic` from `useUserStore`
- Sign out uses `useAuth().signOut()`, navigates to `/`
- Reset calls `resetProfile()` and deletes the `user_data` row

### No Database Changes Needed
Existing `profiles` table already has `display_name`, `avatar_url`, and `bio` columns.
