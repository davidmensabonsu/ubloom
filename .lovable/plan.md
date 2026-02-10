

# Profile Page Enhancements

## Overview
Add four new sections to the existing Profile page: Identity Statement display, Journey Stats, Reminder Settings, Change Password, and a styled confirmation dialog for the reset action.

## New Sections (in order on page)

### 1. Identity Statement
A read-only card showing the user's identity statement and dream-self feelings from onboarding. Displayed between the avatar/name section and the theme picker. Only shown if the user has completed onboarding and has data to display.

### 2. Journey Stats
A card with key metrics displayed in a clean grid:
- **Days on app** (calculated from the earliest journal or mood entry date)
- **Journal entries** (count from `profile.journalEntries`)
- **Habits completed** (count from `profile.habitCompletions` where `completed === true`)
- **Current streak** (calculated from `habitCompletions` data, days with at least 50% completion)

### 3. Reminder Settings
Embed the existing `ReminderSettings` component directly into the Profile page. This component already handles toggling notifications on/off and setting custom times for morning, midday, and evening.

### 4. Change Password
A collapsible section with two password fields (new password + confirm). Uses the existing `supabase.auth.updateUser({ password })` method. Shows success/error feedback via toast.

### 5. Styled Reset Confirmation
Replace the native `window.confirm` with a Radix AlertDialog for the "Reset all data" action, matching the app's visual style.

## Technical Details

### Files Modified
- **`src/pages/Profile.tsx`** -- Add all new sections:
  - Import `ReminderSettings` component
  - Import `AlertDialog` components from `@/components/ui/alert-dialog`
  - Add identity statement card (reads `profile.identityStatement` and `profile.dreamSelfFeels`)
  - Add journey stats card (computes counts from store data)
  - Add `<ReminderSettings />` between theme and account actions
  - Add change password section with local state for fields and `supabase.auth.updateUser`
  - Replace `window.confirm` with `AlertDialog` for reset data
  - Add new icons: `Flame`, `BookOpen`, `Target`, `Lock`, `KeyRound` from lucide-react

### No New Files or Database Changes
All data is already available in the Zustand store or via existing auth APIs.

