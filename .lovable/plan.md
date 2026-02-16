
## Remove Re-Setup Option and Improve First-Time Setup Visibility

### Changes

**1. Remove the "edit habits" gear icon for users who have completed setup**
Once a user has saved their core habits, the Settings2 (gear) icon next to "Daily Habits" will be removed. This prevents re-entering the full setup flow after initial configuration. Users can still add one-off tasks via the `+` buttons.

**2. Make the first-time setup prompt more prominent**
For users who haven't set their core habits yet, replace the current small card with a larger, more visually engaging call-to-action featuring the Sparkles icon, a descriptive subtitle, and a prominent button — making it unmissable.

### Technical details

| File | Change |
|------|--------|
| `src/components/routine/CoreHabitsSection.tsx` | Remove the `onEditHabits` prop entirely. Remove the Settings2 gear button from the header (lines 149-154). Replace the empty-state card (lines 119-137) with a larger, more eye-catching CTA using the Sparkles icon and descriptive text. |
| `src/pages/Routine.tsx` | Remove the `editingHabits` state and the `onEditHabits` callback. Remove the `RoutineSetup` import and the conditional render for `editingHabits`. Keep the first-time `showSetup` flow as-is (triggered by `!profile.routineSetupComplete`). |
| `src/components/routine/RoutineSetup.tsx` | No changes needed — it still serves the initial setup flow. |

The empty-state CTA will look something like:
- A Sparkles icon with animated entrance
- Heading: "Set Up Your Daily Habits"
- Subtitle: "Choose the habits that matter most to you. They'll appear here every day."
- A prominent "Choose My Habits" button that navigates to the setup flow via a custom event or callback
- The callback will set `showSetup` to true in `Routine.tsx`

Since `onEditHabits` is being removed from `CoreHabitsSection`, the empty-state button needs a way to trigger the setup. This will be done by dispatching a custom event (`open-habit-setup`) that `Routine.tsx` listens for to set `showSetup = true`.
