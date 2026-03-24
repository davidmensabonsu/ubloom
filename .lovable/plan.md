

## Move "How did you feel today?" to a Daily Check-in Popup

### What changes

The mood feelings selector will be removed from the Alignment page and instead appear as a full-screen modal/dialog the first time a user opens the app each day. Once they select and confirm their feelings, it won't appear again until the next day.

### Technical approach

**1. Create `DailyMoodCheckin` component** (`src/components/DailyMoodCheckin.tsx`)
- A modal overlay with the feelings selector UI (moved from Alignment page)
- Shows the same feeling options, 3-max selection, confirm button
- On confirm, calls `addMoodEntry()` and closes
- Include a "Skip" option so users aren't forced

**2. Track last check-in date in `userStore.ts`**
- Add `lastMoodCheckinDate?: string` (yyyy-MM-dd) to `UserProfile`
- After confirming feelings, set this to today's date
- Skipping also sets the date (so it doesn't re-appear)

**3. Render in `App.tsx`**
- Add `DailyMoodCheckin` inside the protected route area (after `CloudSyncProvider`)
- Only render when:
  - User is authenticated and onboarding is complete
  - `lastMoodCheckinDate` is not today
  - Current route is a main app page (not onboarding/auth)

**4. Remove feelings section from `Alignment.tsx`**
- Remove the "How did you feel today?" card, related state (`selectedFeelings`, `feelingsConfirmed`, `feelingsExpanded`), and the feelings logic from `handleSave`
- Keep the journal, future self message, mood trends, and history sections
- Update the save button to only handle journal entries

### Files to modify
- `src/stores/userStore.ts` — add `lastMoodCheckinDate` field
- `src/components/DailyMoodCheckin.tsx` — new modal component
- `src/App.tsx` — render the check-in modal
- `src/pages/Alignment.tsx` — remove feelings section

